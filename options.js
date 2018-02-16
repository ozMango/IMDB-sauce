/*global document, console, browser, alert, modSitesdb, confirm, mSites */
/*jslint laxcomma:true */
// jshint undef:true
// jshint eqeqeq:true
// jshint forin:true
// jshint latedef:true
// Create the non-site dictionary for appConfig

// var mSites = modSitesdb();
function saveOptions(e, iObj, iDoneFn, iAlertB, iStoreS ) {
	var onStore = function() {
		if ( iAlertB === true ) {
			alert( iStoreS + ' saved' );
		}
		iDoneFn( );
	};
	var onErrorB = function() {
		alert( 'error ' + iStoreS + ' NOT saved' );
	};
	console.log( 'save ' + iStoreS );
  e.preventDefault();
//	var aObj = { scoutConfig: mSites.appConfig.store };
	var bPromise = browser.storage.local.set( iObj );
	bPromise.then(onStore, onErrorB);
}

document.querySelectorAll('input');
// document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", function( e ) {
	saveOptions( e, { scoutConfig: mSites.appConfig.store }, function(){}, true, 'options' ); 
} );
var getEmpty = function( iId ) {
	var bEl = document.getElementById( iId );
	while (bEl.firstChild) {
		bEl.firstChild.remove();
	}
	return bEl;
};
var makeTextAddRemover = function( iObj, iFldS, iInx, iFn ) {
	return function( e ) {
		var j, bSs, nxInx;
		if ( e.target.checked === true ) { // add
			iObj[iFldS].push(iInx);
		} else { // remove
			bSs = [];
			for ( j=0; (nxInx=iObj[iFldS][j])!==undefined; j++ ) {
				if ( nxInx !== iInx ) {
					bSs.push( nxInx );
				}
			}
			iObj[iFldS] = bSs;
		}
		iFn();
	};
};
var currentTextsList = function( iDic, iObj, iFldS, iLabelEl, iRedoFn ) {
	var j, nxInx,pickDivEl,tickEl;
	for ( j=0; (nxInx=iObj[iFldS][j])!==undefined; j++ ) {
		pickDivEl = document.createElement('div');
		tickEl = document.createElement('input');
		tickEl.setAttribute( 'type', 'checkbox' );
		tickEl.setAttribute( 'checked', 'checked' );
		pickDivEl.appendChild( tickEl );
		pickDivEl.appendChild( document.createTextNode(nxInx + ': ' + iDic[nxInx]) );
		iLabelEl.appendChild( pickDivEl );
		tickEl.addEventListener( 'change', makeTextAddRemover( iObj, iFldS, nxInx, iRedoFn ) );
	}
};
var addXrefDiv = function( iDivEl, iFldS, iInx, iArrayB ) {
	var j, refDivEl, nxSite, aSites = [], matchB,bS, bSs = [];
//	console.log( 'createXrefDiv-10' );
	refDivEl = document.createElement('div');
	for ( j=0; (nxSite=mSites.appConfig.siteMap.sites[j])!==undefined; j++ ) {
		if ( nxSite[iFldS] !== undefined ) {
//			console.log( 'createXrefDiv ' + nxSite[iFldS] );
			if ( iArrayB === true ) {
//				aSites.push( nxSite );
				matchB = ( nxSite[iFldS].indexOf( iInx ) !== -1 );
			} else {
				matchB = ( nxSite[iFldS] === iInx ); 
			}
			if ( matchB === true ) {
				aSites.push( nxSite );
			}
		}
//		console.log( 'createXrefDiv-90' );
	}
	bS = aSites.length + ' reference(s)';
	if ( aSites.length > 0 ) {
		bS += ': ';
		for ( j=0; (nxSite=aSites[j])!==undefined; j++ ) {
			bSs.push( nxSite.name);
		}
		bS += bSs.join(', ');
	}
	refDivEl.appendChild( document.createTextNode(bS) );
	iDivEl.appendChild( refDivEl );
	return aSites.length;
};

var textPoolWidget = function( iDic, iSelDivId, iObj, iFldS, iArrayB, iFieldLabelS, iRedoFn  ) { // mSites.appConfig.siteMap.searchDic, , nxSite.searchInx
//	console.log( 'textPoolWidget ' + iFldS );
	var inx, labelEl, textDivEl, textEl, bS, containDivEl,pickDivEl, j, selEl, optEl, aInxs
	,selDivEl,tickSelEl,textUpdateButEl,textNewButEl,textExtraDivEl, textDelButEl, aInx, xrefsN = -1;
	var getInxs = function( iDic ) {
		var inxs = [], inx;
		for ( inx in iDic ) {
			if ( iDic.hasOwnProperty( inx ) ) {
				if (inx !== 'allocN' ) {
					inxs.push(inx);
				}
			}
		}
		return inxs;
	};
	
	containDivEl = getEmpty( iSelDivId );
	containDivEl.setAttribute( 'style', 'border-style: solid; margin:5px; padding:2px' );
	labelEl = document.createElement('label');
	labelEl.appendChild(document.createTextNode(iFieldLabelS));
	if ( iArrayB === true ) {
		currentTextsList( iDic, iObj, iFldS, labelEl, iRedoFn ); //list of current texts with tick box on each
		// separator line
		pickDivEl = document.createElement('div');
		if ( iObj[iFldS].length > 0 ) {
			bS = 'plus';
		} else {
			bS = 'non selected';
		}
		pickDivEl.appendChild( document.createTextNode(bS) );
		labelEl.appendChild( pickDivEl );
	}
//	console.log( 'textPoolWidget-10' );
	selDivEl = document.createElement('div');
	if ( iArrayB === true ) {
		tickSelEl = document.createElement('input');
		tickSelEl.setAttribute( 'type', 'checkbox' );
		selDivEl.appendChild( tickSelEl );
	}
	selEl = document.createElement('select');
	selEl.addEventListener( 'change', function( e ) { 
		if ( iArrayB === true ) {
			mSites.appConfig.store[iSelDivId] = e.target.value;
			saveOptions( e, { scoutConfig: mSites.appConfig.store }, iRedoFn, false, 'config' );
		} else {
			iObj[iFldS] = e.target.value;
			iRedoFn();
		}
	} );
	selDivEl.appendChild( selEl );
	textDivEl = document.createElement('div');
	textEl = document.createElement('textarea');
	textUpdateButEl = document.createElement('button');
//	textUpdateButEl.setAttribute( 'name', 'update current text' );
	textUpdateButEl.appendChild( document.createTextNode('update text') );
	textExtraDivEl = document.createElement('div');
	textNewButEl = document.createElement('button');
//	textNewButEl.setAttribute( 'name', 'new text' );
	textNewButEl.appendChild( document.createTextNode('new choice') );
	textEl = document.createElement('textarea');
	textDivEl.appendChild( textEl );
//	console.log( 'textPoolWidget-30 iArrayB:' + iArrayB );
	aInxs = getInxs( iDic );
	if ( iArrayB === true ) {
		aInx = mSites.appConfig.store[iSelDivId];
		if ( aInx === undefined ) {
			aInx = aInxs[0];
		}
//		console.log( 'textPoolWidget-32 aInx' + aInx  );
		if ( aInx !== undefined ) { 
			xrefsN = addXrefDiv( textExtraDivEl, iFldS, aInx, iArrayB );
//			console.log( 'textPoolWidget-34' );
		}
	} else {
		aInx = iObj[iFldS];
	}
//	console.log( 'textPoolWidget-35' );
	textExtraDivEl.appendChild( textUpdateButEl );
	textExtraDivEl.appendChild( textNewButEl );
	if ( xrefsN === 0 ) {
		textDelButEl = document.createElement('button');
		textDelButEl.appendChild( document.createTextNode('Delete') );
		textExtraDivEl.appendChild( textDelButEl );
		textDelButEl.addEventListener( 'click', function( e ) {
			delete iDic[ aInx ];
			iRedoFn();
		} );
	}
	textDivEl.appendChild( textExtraDivEl );
	labelEl.appendChild( selDivEl );
	labelEl.appendChild( textDivEl );
	containDivEl.appendChild( labelEl );
//	console.log( 'textPoolWidget-40' );
	if ( iArrayB === true ) {
		tickSelEl.addEventListener( 'change', makeTextAddRemover( iObj, iFldS, aInx, iRedoFn ) );
	}
	for ( j=0; (inx=aInxs[j])!==undefined; j++ ) {
		optEl = document.createElement('option');
		optEl.setAttribute( 'value', inx );
		bS = iDic[inx];
		if ( bS.length > 60 ) {
			bS = bS.substring(0,60) + '...';
		}
		if ( inx === aInx ) {
			optEl.setAttribute( 'selected', 'selected' );
		}
		optEl.appendChild(document.createTextNode(inx + ': ' + bS));
		selEl.appendChild(optEl);
	}
//	console.log( 'textPoolWidget-50' );
	if ( aInx !== null ) {
		textEl.value = iDic[aInx];
		textUpdateButEl.addEventListener( 'click', function( e ) { 
			iDic[aInx] = textEl.value;
			iRedoFn();
		} );
		textNewButEl.addEventListener( 'click', function( e ) {
			var bInx = 'a' + iDic.allocN;
			iDic.allocN += 1;
			mSites.appConfig.store[iSelDivId] = bInx;
			iDic[bInx] = textEl.value;
			iRedoFn();
		} );
	}
//	console.log( 'textPoolWidget-90' );
};
var siteSelection = function( iFldS, iContainerId, iObjs, iFieldS, iFn ) { // siteInx idSiteSelect
	var j, selEl, rInx = -1, nxObj, optEl;
//	selEl = document.getElementById('idSiteSelect' );
	selEl = getEmpty(iContainerId );
	selEl.addEventListener( 'change', function( e ) { 
		mSites.appConfig.store[iFldS] = e.target.value;
		saveOptions( e, { scoutConfig: mSites.appConfig.store }, iFn, false, 'config' );
	} );
	if ( mSites.appConfig.store[iFldS] !== undefined ) {
		rInx = parseInt( mSites.appConfig.store[iFldS], 10 );
	} else {
		rInx = 0;
	}
	for ( j=0; (nxObj=iObjs[j])!==undefined; j++ ) {
		optEl = document.createElement('option');
		optEl.setAttribute( 'value', j );
		optEl.value = j;
//		console.log( 'j ' + j + ' rInx ' + rInx );
		if ( j === rInx ) {
//			console.log( 'match set selected' );
			optEl.setAttribute( 'selected', 'selected' );
		}
		optEl.appendChild(document.createTextNode(nxObj[iFieldS]));
		selEl.appendChild(optEl);
	}
	return rInx;
};
var otherFldControl = function( iObj, iFldS, iExtrasEl, iUpdateFn, iRedoFn ) {
	var aEl, divEl, labelEl;
	divEl = document.createElement('div');
	labelEl = document.createElement('label');
	labelEl.appendChild(document.createTextNode(iFldS));
	aEl = document.createElement('textarea');
	aEl.setAttribute( 'type', 'text' );
	aEl.appendChild(document.createTextNode( JSON.stringify( iObj )  ) );
//	aEl.setAttribute( 'value', JSON.stringify( iSite[iFldS] ) );
	labelEl.appendChild( aEl );
	divEl.appendChild( labelEl );
	iExtrasEl.appendChild( divEl );
	aEl.addEventListener( 'change', function( e ) {
//		alert( e.target.value );
		try {
			var aObj = JSON.parse( e.target.value );
			iUpdateFn( aObj );
			iRedoFn();
		} catch(err) {
			alert( 'Entered JSON Error:' + err.message );
		}
//		alert ( 'aObj ' + aObj );
	} );
};
var siteEdit = function() {
	var nxSite, siteInx,nameEl,hostEl,checkEl,positiveEl, extrasEl, inx, extraObj;
	var makeChangeBool = function( iFldS ) {
		return function( e ) {
			nxSite[iFldS] = ( e.target.checked === true );
			siteEdit();
		};
	};
	var makeChangeText = function( iFldS ) {
		return function( e ) {
			alert( 'change fld:' + iFldS + ' from ' + nxSite[iFldS] + ' to ' + e.target.value );
			nxSite[iFldS] = e.target.value;
			siteEdit();
		};
	};
	var updateExtras = function( iObj ) {
		var inx;
		for ( inx in iObj ) {
			if ( iObj.hasOwnProperty( inx ) ) {
				nxSite[inx] = iObj[inx];
			}
		}
	};
	siteInx = siteSelection( 'siteInx', 'idSiteSelect', mSites.appConfig.siteMap.sites, 'name', siteEdit );
//	console.log( 'siteInx ' + siteInx );
	if ( siteInx === undefined ) { siteInx = 0; }
	nxSite = mSites.appConfig.siteMap.sites[siteInx];
//	console.log( 'nxSite.name ' + nxSite.name + ' siteInx ' + siteInx );
	//
	nameEl = document.getElementById('idSiteName' );
	nameEl.setAttribute( 'value', nxSite.name );
	nameEl.value = nxSite.name;
	nameEl.addEventListener( 'change', makeChangeText( 'name' ) );
	//
	hostEl = document.getElementById('idSiteHost' );
	hostEl.setAttribute( 'value', nxSite.host );
	hostEl.value = nxSite.host;
	hostEl.addEventListener( 'change', makeChangeText( 'host') ); 
	hostEl = document.getElementById('idSiteHost' );
	//
	checkEl = document.getElementById('idSiteCheck' );
	checkEl.checked = ( nxSite.auto !== false );
	checkEl.addEventListener( 'change', makeChangeBool( 'auto') ); 
	//
	positiveEl = document.getElementById('idSitePositive' );
	positiveEl.checked = ( nxSite.positiveMatch === true );
	positiveEl.addEventListener( 'change', makeChangeBool( 'positiveMatch') ); 
	// texts selected pool  
	textPoolWidget( mSites.appConfig.siteMap.searchDic, 'idSiteSearchDiv', nxSite, 'searchInx', false, 'Link path', siteEdit );
//	console.log( 'nxSite.noneInxs ' + nxSite.noneInxs );
	textPoolWidget( mSites.appConfig.siteMap.noneDic, 'idSiteNoneDiv', nxSite, 'noneInxs', true, 'No Match texts', siteEdit );
//	console.log( 'nxSite.errorInxs ' + nxSite.errorInxs );
	textPoolWidget( mSites.appConfig.siteMap.errorDic, 'idSiteErrorDiv', nxSite, 'errorInxs', true, 'Error texts', siteEdit);
	extrasEl = getEmpty( 'idExtras' );
	extraObj = {};
	for ( inx in nxSite ) {
		if ( nxSite.hasOwnProperty( inx ) ) {
			if ( ['name','host','auto','positiveMatch','searchInx','noneInxs','errorInxs','show'].indexOf( inx ) === -1 ) {
//				otherFldControl( nxSite, inx, extrasEl, siteEdit );
				extraObj[inx] = nxSite[inx];
			}
		}
	}
	otherFldControl( extraObj, 'extra properties', extrasEl, updateExtras, siteEdit );
	document.getElementById('siteUpdate').addEventListener( 'click', function( e ) { 
		saveOptions( e, { siteMap: mSites.appConfig.siteMap }, siteEdit, true, 'siteMap' );
	} );
	document.getElementById('siteReset').addEventListener( 'click', function( e ) {
		mSites.resetSiteMap( mSites );
		saveOptions( e, { siteMap: mSites.appConfig.siteMap }, siteEdit, true, 'siteMap' );
	} );
	document.getElementById('siteClone').addEventListener( 'click', function( e ) { 
		var newInx, newSite = Object.assign({}, nxSite);
		newSite.name += ' clone';
		newInx = siteInx+1;
		if ( newInx === mSites.appConfig.siteMap.sites.length ) {
			mSites.appConfig.siteMap.sites.push( newSite );
		} else {
			mSites.appConfig.siteMap.sites.splice( newInx, 0 , newSite );
		}
		mSites.appConfig.store.siteInx = newInx;
		saveOptions( e, { scoutConfig: mSites.appConfig.store }, siteEdit, false );
	} );
	document.getElementById('siteDelete').addEventListener( 'click', function( e ) { 
		var newInx;
		mSites.appConfig.siteMap.sites.splice( siteInx, 1 );
		newInx = siteInx - 1;
		if ( newInx < 0 ) { newInx = 0; }
		mSites.appConfig.store.siteInx = newInx;
		saveOptions( e, { scoutConfig: mSites.appConfig.store }, siteEdit, false );
//		saveOptions( e, { scoutConfig: mSites.appConfig.store }, iFn, false );
	} );
};

var setFields = function( config_fields ) {
	var bDiv, inx, divEl, val, field, nerdEl, nerdKeyS, nerdS,hEl,labelEl,inEl,fieldS,j,nxSite,bS,bSs,tvB,searchUrlS;
	bDiv = getEmpty( 'addHere' );
//	console.log( 'appConfig.store:' + JSON.stringify( appConfig.store ) );
	for ( inx in config_fields ) {
		if ( config_fields.hasOwnProperty( inx ) ) {
			field = config_fields[ inx ];
//			console.log( 'setFields inx ' + inx + ' ' + JSON.stringify( field ) );
			divEl = document.createElement('div');
			bDiv.appendChild( divEl );
			if (( field.section !== undefined )&&( field.section !== '' )) {
				hEl = document.createElement('h3');
				hEl.appendChild(document.createTextNode(field.section));
				divEl.appendChild( hEl );
			}
			labelEl = document.createElement('label');
			if( mSites.appConfig.store[ inx ] !== undefined ) {
				val = mSites.appConfig.store[ inx ];
			} else {
//				alert( inx + ' undefined ' ); // after added extra site
				val = field.default;
			}
			inEl = document.createElement('input');
			fieldS = field.label;
			bSs = inx.split('_');
			bS = bSs.pop();
			tvB = false;
			if ( bS === 'TV' ) {
				bS = bSs.pop();
				tvB = true;
			}
			for ( j=0; (nxSite=mSites.appConfig.siteMap.sites[j])!==undefined; j++ ) {
				if ( nxSite.name === bS ) {
					if (( tvB === true ) === ( nxSite.TV === true) ) {
//						fieldS += '*' + j;
						searchUrlS = mSites.appConfig.siteMap.searchDic[ nxSite.searchInx ];
						if ( searchUrlS !== undefined ) { // else postUrl
							if ( searchUrlS.indexOf( '%search_' ) !== -1 ) {
								fieldS += ' [text search]';
							}
						}
					}
				}
			}
			if ( field.type === 'checkbox' ) {
				inEl.setAttribute( 'type', 'checkbox' );
				inEl.setAttribute( 'name', inx );
				inEl.setAttribute( 'value', '' );
				if ( val === true ) { 
					inEl.setAttribute( 'checked', 'checked' );
				}
				labelEl.appendChild( inEl );
				labelEl.appendChild(document.createTextNode(fieldS));
			} else {
				inEl.setAttribute( 'type', 'text' );
				inEl.setAttribute( 'name', inx );
				inEl.setAttribute( 'value', val );
				labelEl.appendChild(document.createTextNode(fieldS));
				labelEl.appendChild( inEl );
			}
			divEl.appendChild( labelEl );
		}
	}
	var inputList = document.querySelectorAll('input');
	inputList.forEach( function( iEl, iN, iList ) {
		iEl.addEventListener( 'change', function( ) { 
			var val;
			if ( iEl.getAttribute( 'type' ) === 'checkbox' ) {
				val = ( iEl.checked === true );
			} else {
				val = iEl.value;
			}
//				console.log( 'set ' + iEl.name + ' to ' + val); 
			mSites.appConfig.store[ iEl.name ] = val;
			} );
		}
	);
	document.getElementById('sauceReset').addEventListener( 'click', function( e ) {
		if ( confirm( 'Reset settings to original state, does not effect sticky notes, or link cache' ) ){
			var configFldDefns = mSites.getConfigFldDefns( mSites );
			mSites.appConfig.store = mSites.makeDefaultConfig( configFldDefns );
			saveOptions( e, { scoutConfig: mSites.appConfig.store }, function() { setFields( mSites.getConfigFldDefns( mSites ) ); }, false, 'config' );
		}
	} );
	document.getElementById('sauceNotesClear').addEventListener( 'click', function( e ) { 
		e.preventDefault();
		if ( confirm( 'delete all sticky notes' ) ) {
			mSites.appConfig.notes = {};
			mSites.appConfig.saveNamed( 'notes', function() {} );
		}
	} );
	document.getElementById('sauceCacheClear').addEventListener( 'click', function( e ) { 
		e.preventDefault();
		if ( confirm( 'delete tracker link cache' ) ) {
			mSites.appConfig.imdbs = {};
			mSites.appConfig.saveNamed( 'imdbs', function() {} );
		}
	} );
	document.getElementById('idNerdData').addEventListener( 'change', function( e ) { 
		mSites.appConfig.store.nerdKeyS = e.target.value;
		saveOptions( e, { scoutConfig: mSites.appConfig.store }, function() { setFields( mSites.getConfigFldDefns( mSites ) ); }, false, 'config' );
	} );
	document.getElementById('idNerdImport').addEventListener( 'click', function( e ) {
		var aJson,jsonS,textEl;
		var merge = function( iJson, iFldS ) {
			var inx;
			for ( inx in iJson ) {
				if ( iJson.hasOwnProperty( inx ) ) {
					mSites.appConfig[iFldS][inx] = iJson[inx];
				}
			}
		};
		e.preventDefault();
		textEl = document.getElementById('saucetextarea');
		jsonS = textEl.value;
		if ( jsonS === '' ) {
			alert( 'no data entered' );
		} else {
			try {
//				console.log( 'jsonS:' + jsonS );
				aJson = JSON.parse(jsonS);
//				console.log( 'parsed jsonS:' + jsonS );
			} catch(err) {
				alert( 'Entered JSON Error:' + err.message );
			}
			nerdKeyS = mSites.appConfig.store.nerdKeyS;
			if ( nerdKeyS === "1" ) {
				merge( aJson, 'notes' );
				mSites.appConfig.saveNamed( 'notes', function() {} );
			} else if ( nerdKeyS === "2" ) {
				merge( aJson, 'imdbs' );
				mSites.appConfig.saveNamed( 'imdbs', function() {} );
			} else if ( nerdKeyS === "3" ) {
				mSites.appConfig.siteMap = aJson;
				mSites.appConfig.saveNamed( 'siteMap', function() {} );
			} else if ( nerdKeyS === "0" ) {
				alert( 'json OK, no action selected' );
			}
		}
	} );
	nerdS = '';
	nerdKeyS = mSites.appConfig.store.nerdKeyS;
	if ( nerdKeyS !== undefined ) {
		document.getElementById('idNerdData').value = nerdKeyS;
	}
	if ( nerdKeyS === "1" ) {
		nerdS = JSON.stringify( mSites.appConfig.notes );
	} else if ( nerdKeyS === "2" ) {
		nerdS = JSON.stringify( mSites.appConfig.imdbs );
	} else if ( nerdKeyS === "3" ) {
		nerdS = JSON.stringify( mSites.appConfig.siteMap );
	} else if ( nerdKeyS === "4" ) {
		nerdS = 'spare';
	} else if ( nerdKeyS === "0" ) {
		nerdS = 'none';
	}
	nerdEl = document.getElementById('saucetextarea'); 
	nerdEl.value = nerdS;
	siteEdit();
};
mSites.setupConfig( mSites, function() { setFields( mSites.getConfigFldDefns( mSites ) ); } );

