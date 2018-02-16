/*global modSitesdb, URL, document, location, $, XMLHttpRequest, console, alert, FormData, window, mSites */
/*jslint laxcomma:true */
// jshint undef:true
// jshint eqeqeq:true
// jshint forin:true
// jshint latedef:true
var modSauce = function( ) { 'use strict';
	var mod = {};
	var bugB = false;
	// For internal use (order matters)
	var valid_states = [ 'found', 'missing', 'logged_out', 'error' ];
	var substituteMacros = function( iSite, iS, movie_id, movie_title ) {
		var bS = iS;
		var space_replace = ('spaceEncode' in iSite) ? iSite.spaceEncode : '+';
		var search_string = movie_title.replace(/ +\(.*/, '').replace(/\s+/g, space_replace);
		var movie_year = document.title.replace(/^(.+) \((.*)([0-9]{4})(.*)$/gi, '$3');
		return bS.replace(/%tt%/g, 'tt' + movie_id)
		.replace(/%nott%/g, movie_id)
		.replace(/%search_string%/g, search_string)
		.replace(/%year%/g, movie_year);
	};
	var replaceSearchUrlParams = function(site, movie_id, movie_title) {
		var search_url, rS;
		if ( site.goToUrl !== undefined ) {
			search_url = site.host + site.goToUrl;
		} else if ( site.searchInx === '' ) {
			search_url = site.host + site.postUrl;
//			console.log( 'replaceSearchUrlParams-10 ' + site.name + ' ' + search_url );
		} else {
			search_url = site.host + mSites.appConfig.siteMap.searchDic[site.searchInx];
//			console.log( 'replaceSearchUrlParams-20 ' + site.name + ' ' + search_url );
		}
//		console.log( 'replaceSearchUrlParams ' + site.name + ' search_url ' + search_url );
		rS = substituteMacros( site, search_url, movie_id, movie_title );
//		console.log( 'rS ' + rS );
		return rS;
	};
	// Small utility function to return a site's icon
	var getFavicon = function(site, hide_on_err) {
		var favicon;
		if (typeof(hide_on_err) === 'undefined') hide_on_err = false;
		if ('icon' in site) {
			favicon = site.icon;
		} else {
			favicon = site.host + '\/favicon.ico';
		}
		var img = $('<img />').attr({'style': '-moz-opacity: 0.4; border: 0; vertical-align: text-top',
			'width': '16',
			'src': favicon,
			'title': site.name,
			'alt': site.name});
		if (hide_on_err) img.attr('onerror', "this.style.display='none';");
		return img;
	};
	// make search link element
	// state should always be one of the values defined in valid_states
	var makeLinkJe = function( iMovieId, site, state) {
		var linkJe, target = getTarget( site, iMovieId );
		linkJe = $('<a />').attr('href', target).attr('target', '_blank');
		if ($.inArray(state, valid_states) < 0) {
			console.log("Unknown state " + state);
		}
		if (mSites.appConfig.get('use_icons')) {
			var icon = getFavicon(site);
			icon.css({'border-width': '3px', 'border-style': 'solid', 'border-radius': '2px'});
			if (state === 'error' || state === 'logged_out') {
				icon.css('border-color', 'red');
			} else if (state === 'missing') {
				icon.css('border-color', 'yellow');
			} else {
				icon.css('border-color', 'green');
			}
			linkJe.append(icon);
		} else {
			if (state === 'missing' || state === 'error' || state === 'logged_out') {
				linkJe.append($('<s />').append(site.name));
			} else {
				linkJe.append(site.name);
			}
			if (state === 'error' || state === 'logged_out') {
				linkJe.css('color', 'red');
			}
		}
		return linkJe;
	};
	// add search link to results list
	var addLinkJe = function( iSpot, iLinkJe, state) {
		$(iSpot.resEl).append(iLinkJe).addClass('result_box').append($('<span> </span>'));
	};
	var getTarget = function( iSite, movieId ) {
		var movie_title = '';
		return replaceSearchUrlParams( iSite, movieId, movie_title );
	};
	var showImdbFinds = function( iSpot, iImbdFind, movieId, iExtraB ) {
		var j, nxSite, statusS, linkJe, searchUrlS;
		$(iSpot.resEl).empty();
		if ( iImbdFind !== undefined ) {
			for ( j=0; (nxSite=mSites.appConfig.siteMap.sites[j])!==undefined; j++ ) {
				if ( nxSite.auto !== false ) {
					statusS = '';
					if ( iImbdFind.found.indexOf( nxSite.name ) !== -1 ) {
						statusS = 'found';
					}
					if ( iImbdFind.missing.indexOf( nxSite.name ) !== -1 ) {
						statusS = 'missing';
					}
					if ( iImbdFind.denied.indexOf( nxSite.name ) !== -1 ) {
						statusS = 'logged_out';
					}
					if ( iImbdFind.error.indexOf( nxSite.name ) !== -1 ) {
						statusS = 'error';
					}
					if ( statusS !== '' ) {
						linkJe = makeLinkJe( movieId, nxSite, statusS );
						addLinkJe( iSpot, linkJe, statusS );
					}
				}
			}
		}
		if ( iExtraB === true ) {
			for ( j=0; (nxSite=mSites.appConfig.siteMap.sites[j])!==undefined; j++ ) {
				if ( nxSite.auto === false ) {
					if ( nxSite.show === true ) {
						searchUrlS = mSites.appConfig.siteMap.searchDic[nxSite.searchInx];
						if ( searchUrlS.indexOf( '%search_') === -1 ) {
							linkJe = makeLinkJe( movieId, nxSite, statusS );
							addLinkJe( iSpot, linkJe, statusS );
						}
					}
				}
			}
		}
	};
	var setFormData = function( iSite, movie_id, movie_title ) {
		var inx, valS;
		var formData = new FormData();
		for ( inx in iSite.postData ) {
			if ( iSite.postData.hasOwnProperty( inx ) ) {
//				console.log( 'setpostData ' + inx + ' val ' + iSite.postData[inx] );
				valS = substituteMacros( iSite, iSite.postData[inx], movie_id, movie_title );
				formData.append(inx, valS);
			}
		}
		return formData;
	};
	var concatRegex = function( iDic, iInxs ) {
		var bSs = [], j, nxInx;
		for ( j=0; (nxInx=iInxs[j])!==undefined; j++ ) {
			bSs.push( iDic[ nxInx ] );
		}
		return bSs.join('|');
	};
	// Performs an ajax request to determine if tracker has title
	var maybeAddLink = function( iSites, search_url, iSite, progress, iDoneFn ) {
		var maybeAllDone = function( iProgress, iFoundS, iSite ) {
			iProgress.doneN += 1;
			var imdbsSaved = function( ) {
				iDoneFn();
	//			alert( 'imdbsSaved done all ' + iSites.length + ' result ' + JSON.stringify( mSites.appConfig.imdbs ) );
			};
			mSites.appConfig.imdbs[ iProgress.movieIdN][iFoundS].push( iSite.name );
//			console.log( 'doneN ' + iProgress.doneN + ' of ' + iSites.length );
			if ( iProgress.doneN === iSites.length ) {
				mSites.appConfig.saveNamed( 'imdbs', imdbsSaved );
			}
		};
		var success_match = ('positiveMatch' in iSite) ? iSite.positiveMatch : false;
		var foundS;
		var xhr = new XMLHttpRequest();
//		console.log( 'doGet url:' + search_url );
	//	xhr.withCredentials = true;
		if ( iSite.searchInx !== '' ) {
			xhr.open("GET", search_url, true);
		} else {
			xhr.open("POST", iSite.host + iSite.postUrl, true );
		}
		xhr.onload = function () {
			var loggedOutRegex, matchRegex;
			if ( bugB ) {console.log( 'doGet onload xhr.readyState:' + xhr.readyState + ' iSite ' + iSite.name ); }
			if (xhr.readyState === 4) {
				foundS = 'error';
				if (xhr.status === 200) {
//						if ( iSite.name === 'RS' ) {
//							console.log( 'xhr.responseText:' + xhr.responseText );
//							console.log( 'String(xhr.responseText).match(iSite.matchRegex):' + String(xhr.responseText).match(iSite.matchRegex) );
//							console.log( 'success_match:' + success_match );
//						}
//					console.log( 'onload site ' + JSON.stringify( iSite ) );
					matchRegex = concatRegex( mSites.appConfig.siteMap.noneDic, iSite.noneInxs );
//					console.log( 'matchRegex ' + matchRegex + ' iSite.name ' + iSite.name );
					if (String(xhr.responseText).match(matchRegex) ? !(success_match) : success_match) {
//					if (String(xhr.responseText).match(iSite.matchRegex) ? !(success_match) : success_match) {
//						console.log( 'match1' );
						foundS = 'missing';
					} else {
						foundS = 'found';
						if ( iSite.errorInxs.length > 0 ) {
							loggedOutRegex = concatRegex( mSites.appConfig.siteMap.errorDic, iSite.errorInxs );
							if ( String(xhr.responseText).match(loggedOutRegex)) {
								foundS = 'denied';
							}
						}
					}
				} else {
					console.log( 'ERROR Page ' + search_url + ' status:' +  xhr.status + ' search_url ' + search_url );
				}
				maybeAllDone( progress, foundS, iSite );
			}
		};
		xhr.onerror = function ( e ) {
			console.log( 'doGet onerror xhr.statusText:' + xhr.statusText + ' ' + search_url + ' error ' + e );
			maybeAllDone( progress, 'error', iSite );
		};
		if ( iSite.postUrl !== undefined ) {
			xhr.send( setFormData( iSite, progress.movieIdN, '' ) );
		} else {
			xhr.send( null );
		}
	};
	var selectedSites = function( ) {
		var aSites = [],index,site;
		$.each(mSites.appConfig.siteMap.sites, function(index, site) {
			if ( bugB ) {console.log( 'selectedSites ' + site.name + ' site.auto ' + site.auto + ' site.show ' + site.auto );}
			if ( site.auto !== false ) {
				if (site.show) {
					aSites.push( site );
				}
			}
		} );
		return aSites;
	};
	// Run code to create fields and display sites 
	var querySites = function( movie_id, movie_title, iSites, iDoneFn ) {
		var linkJe, progress;
//		var movie_id = iSpot.ttS.substring(2);
		var haveImdbStore = function(  ) {
//			mSites.appConfig.imdbs = iStore.imdbs;
			progress = { doneN:0, movieIdN:movie_id, results:{}, totalN:iSites.length };
			mSites.appConfig.imdbs[movie_id] = { found:[], denied:[], missing:[], error:[] };
			$.each( iSites, function(index, site) {
				var searchUrl = replaceSearchUrlParams(site, movie_id, movie_title);
				if ( bugB ) {console.log( 'searchUrl ' + searchUrl );}
				maybeAddLink( iSites, searchUrl, site, progress, iDoneFn );
			} );
		};
		var onError = function( ) {
			console.error('imdb store failed');
		};
		mSites.appConfig.reload( 'imdbs', haveImdbStore );
//		var aPromise = browser.storage.local.get( ['imdbs'] );
//		aPromise.then(haveImdbStore, onError);
	};
	var getEnhanceSpots = function( iTitlePageB ) {
		// exclude 
		// - image links, redundent on IMDB pages
		// - episode links on IMDB
		var linkEls, j, nxEl, hrefS, queryS, aSpots = [], bSs = [], ttS, inx, skipB, imdbB;
		if ( iTitlePageB === true ) {
			var movie_title = $('title').text().match(/^(.*?) \(/)[1];
			var movie_id = document.URL.match(/\/tt([0-9]+)\//)[1].trim('tt');
			var is_tv_page = Boolean($('title').text().match('TV Series')) ||
					Boolean($('.tv-extra').length);
			var is_movie_page = Boolean($('title').text().match(/.*? \(([0-9]*)\)/));
			aSpots.push( { el:getLinkArea()[0], ttS:'tt'+movie_id } );
			addIconBar(movie_id, movie_title);
		}
		linkEls = document.getElementsByTagName('a');
		for ( j=0; (nxEl=linkEls[j])!==undefined; j++ ) {
			hrefS = nxEl.href.split('?')[0];
			queryS = nxEl.href.split('?')[1];
			if (( queryS !== undefined )&&(queryS.indexOf('http') !== -1 ) ) { // redirection service
				hrefS = queryS.substring( queryS.indexOf('http') );
				hrefS = decodeURIComponent(hrefS);
//				console.log( hrefS );
			}
			bSs = hrefS.split('/');
			inx = bSs.indexOf('title');
			if ( hrefS.indexOf('imdb.com') !== -1 ) {
				imdbB = ( location.href.indexOf( 'imdb.com' ) !== -1 );
				skipB = false;
				if ( imdbB === true ) {
					if ( nxEl.getElementsByTagName('img').length !== 0 ) { skipB = true; } 
					if ( nxEl.parentNode.className.indexOf('episode') !== -1 ) { skipB = true; }
				}
				if ( skipB === false ) {
					if ( bSs[ inx+2 ] !== undefined ) {
						if ( bSs[ inx+2 ] !== '' ) { skipB = true; }
					}
					if (( queryS !== undefined )&&(queryS.indexOf('cons_tt') !== -1 ) ) { skipB = true; }
				}
				if ( skipB === false ) {
					if (( inx !== -1 )&&(bSs[ inx+1 ] !== undefined)) {
						ttS = bSs[inx+1];
						aSpots.push( {el:nxEl, ttS:ttS} );
					}
				}
			}
		}
		return aSpots;
	};
	var doPage = function( iTitlePageB ) {
		var aSites;
		var exhanceImdbLinks = function( ) {
			if ( bugB ) {console.log('exhanceImdbLinks-10');}
			var j, nxSpot, aSpots, paEl, spanEl, newEl, imbdFind,closeEl,noteEl,noteS,writeEl,plusMinusS
			,tickEl,moreTickJe;
			aSpots = getEnhanceSpots( iTitlePageB );
			var makeHandler = function( iSpot ) {
				return function( ) {
					var find = [];
					var aSites = selectedSites( );
					querySites( iSpot.ttS.substring(2), '', aSites, exhanceImdbLinks );
				};
			};
			var makeToggleMore = function( iSpot, iTickEl ) {
				return function( ) {
//					alert( 'toggleMore' + $(iTickEl).text() );
					if ( $(iTickEl).text() === '-' ) {
						$(iTickEl).text('+');
					} else {
						$(iTickEl).text('-');
					}
					exhanceImdbLinks();
				};
			};
			var makeEditNote = function( iSpot, paEl, noteEl ) {
				return function( ) {
					var makeNoteChanged = function ( iSpot, inputEl ) {
						return function( ) {
							mSites.appConfig.reload( 'notes', function() {
								var val = inputEl.value;
								mSites.appConfig.notes[ iSpot.ttS.substring(2) ] = val;
								mSites.appConfig.saveNamed( 'notes', exhanceImdbLinks );
							} );
						};
					};
					var val, inputEl = document.createElement('input');
					val = mSites.appConfig.notes[ iSpot.ttS.substring(2) ];
					if ( val !== undefined ) {
						inputEl.value = val;
					}
					paEl.replaceChild( inputEl, noteEl );
					inputEl.addEventListener("change", makeNoteChanged( iSpot, inputEl ) );
				};
			};
			for ( j=0; (nxSpot=aSpots[j])!==undefined; j++ ) {
//				console.log( 'nxSpot.el ' + nxSpot.el + ' j ' + j );
				paEl = nxSpot.el.parentNode;
				// replace link with span containing link and extras
				plusMinusS = '+';
				if ( paEl.getAttribute( 'class' ) === 'saucelink' ) {
					spanEl = paEl;
					moreTickJe = $(spanEl).find('.moreLink');
					if ( moreTickJe.text() === '-' ) {
						plusMinusS = '-';
					}
					if ( bugB ) {console.log( ' exhanceImdbLinks enisting ' + moreTickJe.text() );}
					$(spanEl).empty();
					while (spanEl.firstChild) {
						spanEl.firstChild.remove();
					}
				} else {
					spanEl = document.createElement('span');
					spanEl.setAttribute( 'class', 'saucelink' );
					paEl.replaceChild( spanEl, nxSpot.el );
				}
				spanEl.appendChild( nxSpot.el, null );
				newEl = document.createElement('span');
				newEl.setAttribute( 'class', 'extrasauce' );
				newEl.setAttribute( 'style', 'cursor:pointer' );
				newEl.setAttribute( 'title', 'get/update torrent availabilty' );
//				newEl.appendChild(document.createTextNode(' \u2620[' )); // &#9760
//				newEl.appendChild(document.createTextNode(' \u2BD0[' )); // link
				newEl.appendChild(document.createTextNode(' \u2315[' )); // telephone responder
				spanEl.appendChild( newEl, null );
				nxSpot.resEl = document.createElement('span');
				nxSpot.resEl.setAttribute( 'class', 'resultsauce' );
				spanEl.appendChild( nxSpot.resEl, null );
				closeEl = document.createElement('span');
				closeEl.appendChild(document.createTextNode(']'));
				spanEl.appendChild( closeEl, null );
				tickEl = document.createElement('span');
				tickEl.setAttribute( 'class', 'moreLink' );
				tickEl.setAttribute( 'style', 'cursor:pointer' );
				tickEl.setAttribute( 'title', 'hide/show extra search links' );
				tickEl.appendChild(document.createTextNode(plusMinusS));
				spanEl.appendChild( tickEl, null );
				if (mSites.appConfig.get('sticky_notes')) {
					writeEl = document.createElement('span');
					writeEl.appendChild(document.createTextNode( ' \u270e[' ) ); // &#9998;
//					writeEl.innerHTML = ' &#9998;[';
					writeEl.setAttribute( 'style', 'cursor:pointer' );
					writeEl.setAttribute( 'title', 'add/edit note' );
					spanEl.appendChild( writeEl, null );
					noteEl = document.createElement('span');
					noteS = mSites.appConfig.notes[nxSpot.ttS.substring(2)];
					if ( noteS !== undefined ) {
						noteEl.appendChild(document.createTextNode(noteS));
					}
					noteEl.setAttribute( 'class', 'saucenote' );
					spanEl.appendChild( noteEl, null );
					closeEl = document.createElement('span');
					closeEl.appendChild(document.createTextNode(']'));
//					closeEl.innerHTML = ']';
					spanEl.appendChild( closeEl, null );
				}
				imbdFind = mSites.appConfig.imdbs[nxSpot.ttS.substring(2)];
				if ( imbdFind !== undefined ) {
					showImdbFinds( nxSpot, imbdFind, nxSpot.ttS.substring(2), ( plusMinusS === '-' ) );
				}
				newEl.addEventListener("click", makeHandler( nxSpot ) );
				tickEl.addEventListener("click", makeToggleMore( nxSpot, tickEl ) );
				if (mSites.appConfig.get('sticky_notes')) {
					writeEl.addEventListener("click", makeEditNote( nxSpot, spanEl, noteEl ) );
				}
			}
		};
		if ( bugB ) { console.log( 'do_page iTitlePageB ' + iTitlePageB ); }
		if ( iTitlePageB === true ) {
			aSites = selectedSites( );
			if ( bugB ) { console.log( 'do_page aSites.length ' + aSites.length ); }
			var movie_title = $('title').text().match(/^(.*?) \(/)[1];
			var movie_id = document.URL.match(/\/tt([0-9]+)\//)[1].trim('tt');
//			var is_tv_page = Boolean($('title').text().match('TV Series')) ||
//					Boolean($('.tv-extra').length);
//			var is_movie_page = Boolean($('title').text().match(/.*? \(([0-9]*)\)/));
			querySites( movie_id, movie_title, aSites, exhanceImdbLinks );
		} else {
			exhanceImdbLinks();
		}
	};
	// Adds a dictionary of icons to the top of the page.
	// Unlike the other URLs, they aren't checked to see if the movie exists.
	var addIconBar = function(movie_id, movie_title) {
		var iconbar;
		if ( $('#imdbsauce_iconbar' ).length === 0 ) {
			if ($('h1.header:first').length) {
				iconbar = $('h1.header:first').append($('<br/>'));
			} else if ($('.title_wrapper h1')) {
				iconbar = $('.title_wrapper h1').append($('<br/>'));
			} else {
				iconbar = $('#tn15title .title-extra');
			}
			iconbar.attr('id', 'imdbsauce_iconbar');
			$.each(mSites.appConfig.siteMap.sites, function(index, site) {
				if ( site.auto === false ) {
					if (site.show) {
						var search_url = replaceSearchUrlParams(site, movie_id, movie_title);
						var image = getFavicon(site);
						var html = $('<span />').append($('<a />').attr('href', search_url)
						.addClass('iconbar_icon').append(image));
						iconbar.append(html).append(' ');
					}
				}
			});
		}
	};
	//------------------------------------------------------
	// Find/create elements
	//------------------------------------------------------

	var getLinkArea = function() {
		// If it already exists, just return it
		if ($('#imdbscout_header').length) {
			return $('#imdbscout_header');
		}
		var p = $('<p />').append('<h2>' + mSites.appConfig.get('imdbscout_header_text') + '</h2>')
		.attr('id', 'imdbscout_header').css({
			'padding': '0px 20px',
			'font-weight': 'bold'
		});
		$.each(valid_states, function(i, name) {
			p.append($('<span />').attr('id', 'imdbscout_' + name));
		});
		if ($('h1.header:first').length) {
			$('h1.header:first').parent().append(p);
		} else if ($('#title-overview-widget').length) {
			$('#title-overview-widget').parent().append(p);
		} else {
			$('#tn15rating').before(p);
		}
		return $('#imdbscout_header');
	};
	var doTtSearch = function( iMovieId ) {
		$('#tsstac')[0].value = 'tt' + iMovieId;
		$('#search_type')[0].value = 't_genre';
		$('#searchtorrent')[0].submit();
	};
	var makeTjEnhance = function( iDocument ) {
		return function() {
			doPage( false );
		};
	};
	var switching = function(  ) {
		var j,nxSite,hostS,actionS = '',params,movieId;
		if ( bugB ) { console.log( 'switching 10' ); }
		mSites.setupConfig( mSites, function() {
			if ( bugB ) { console.log( 'switching 20' ); }
			document.addEventListener('sauce', makeTjEnhance( document ), false);
			if ( location.href.indexOf( 'fred.dogbond.com/test.html' ) !== -1 ) {
				actionS = 'tjEnhance';
			} else if ( location.href.indexOf( 'www.imdb.com/title' ) !== -1 ) {
				actionS = 'IMDB Title';
			} else {
				if ( location.href.indexOf( 'www.imdb.com' ) !== -1 ) {
					actionS = 'links';
				} else {
					if ( mSites.appConfig.get('enhance_torrent_pages') === true ) {
						hostS = location.hostname;
//						console.log( 'hostS ' + hostS );
						for ( j=0; (nxSite=mSites.appConfig.siteMap.sites[j])!==undefined; j++ ) {
							if ( nxSite.auto === false ) {
/*
								bS = nxSite.searchUrl;
								if ( bS === undefined ) {
									bS = nxSite.postUrl;
								}
*/
								if ( nxSite.host.indexOf( hostS ) !== -1 ) {
//								if ( bS.indexOf( hostS ) !== -1 ) {
									actionS = 'links';
								}
							} else {
/*
								bS = nxSite.searchUrl;
								if ( bS === undefined ) {
									bS = nxSite.postUrl;
								}
								if ( bS.indexOf( hostS ) !== -1 ) {
*/
//								console.log( 'site ' + nxSite.name + ' host ' + nxSite.host );
								if ( nxSite.host.indexOf( hostS ) !== -1 ) {
									actionS = 'links';
									params = (new URL(document.location)).searchParams;
									if ( nxSite.postUrl !== undefined ) {
										if ( params.get('tt') !== null ) {
	//										alert( 'tt:' + params.get('tt') );
											actionS = 'searchTt';
											movieId = params.get('tt');
										}
									}
								}
							}
						}
					}
					if ( mSites.appConfig.get('enhance_all_pages') === true ) {
						actionS = 'links';
					}
				}
			}
			if ( bugB ) { console.log( 'switching actionS ' + actionS ); }
			if ( actionS === 'searchTt' ) {
				doTtSearch( movieId );
			} else if ( actionS === 'links' ) {
				doPage( false );
			} else if ( actionS === 'IMDB Title' ) {
				doPage( true );
			} else if ( actionS === 'tjEnhance' ) {
//				document.addEventListener('sauce', makeTjEnhance( document ), false);
//				document.addEventListener('sauce', makeTjEnhance( document ), false);
			} else if ( actionS !== '' ) {
				alert( 'unhandled action:' + actionS );
			}
		} );
	};
	mod.switching = switching;
	return mod;
};
var mSauce = modSauce();
mSauce.switching();
