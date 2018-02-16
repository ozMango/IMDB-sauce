/*global browser, alert, console, $ */
/*jslint laxcomma:true */
// jshint undef:true
// jshint eqeqeq:true
// jshint forin:true
// jshint latedef:true
//------------------------------------------------------
// A list of all the sites, and the data necessary to
// check IMDb against them.
// Each site is a dictionary with the following attributes:
//  - name:
//      The site name, abbreviated
//  - searchUrl:
//      The URL to perform the search against, see below for how
//      to tailor the string to a site
//  - matchRegex:
//      The string which appears if the searchUrl *doesn't* return a result
//  - postiveMatch:
//      Changes the test to return true if the searchUrl *does* return
//      a result that matches matchRegex
//  - TV (optional):
//      If true, it means that this site will only show up on TV pages.
//      By default, sites only show up on movie pages.
//  - spaceEncode (optional):
//      Changes the character used to encode spaces in movie titles
//      The default is '+'.
//  - goToUrl (optional):
//      Most of the time the same URLs that are used for checking are
//      the ones that are used to actually get to the movie,
//      but this allows overriding that.
//  - loggedOutRegex (optional):
//      If any text on the page matches this regex, the site is treated
//      as being logged out, rather than mising the movie. This option is
//      not effected by postiveMatch.
// To create a search URL, there are four parameters
// you can use inside the URL:
//  - %tt%:
//      The IMDb id with the tt prefix (e.g. tt0055630)
//  - %nott%:
//      The IMDb id without the tt prefix (e.g. 0055630)
//  - %search_string%:
//      The movie title (e.g. Yojimbo)
//  - %year%:
//      The movie year (e.g. 1961)
// See below for examples
//------------------------------------------------------
var modSitesdb = function( ) { 'use strict';
	var mod = {};
	var allSites;
	var siteMap = {
		"searchDic": {
			"allocN": 97,
			"a1": "/browse.php?descr=1&btnSubmit=Submit&search=%tt%",
			"a2": "/torrents.php?id=%tt%",
			"a3": "/torrents.php?searchstr=%search_string%+%year%&filter_cat[6]=1&filter_cat[7]=1&filter_cat[8]=1&filter_cat[9]=1",
			"a4": "/torrents.php?searchstr=%search_string%&filter_cat[1]=1&filter_cat[2]=1&filter_cat[3]=1&filter_cat[4]=1&filter_cat[5]=1",
			"a5": "/movies?search=&imdb=%tt%",
			"a6": "/tv-shows?search=&imdb=%tt%",
			"a7": "/search?name=%search_string%",
			"a8": "/torrents.php?action=basic&filter_cat[9]=1&searchstr=%search_string%+%year%",
			"a9": "/torrents.php?action=basic&filter_cat[8]=1&filter_cat[10]=1&searchstr=%search_string%",
			"a10": "/browse.php?search=&incldead=0&cat=0&dsearch=%tt%&stype=or",
			"a11": "/browse.php?search=%tt%&searchin=title&incldead=1",
			"a12": "/browse.php?c40=1&c44=1&c48=1&c89=1&c46=1&c45=1&search=%search_string%&searchin=title&incldead=0",
			"a13": "/torrents.php?cat=0&search=%tt%",
			"a14": "/search.php?search=%search_string%&options=AND&in=original&incldead=1",
			"a15": "/browse.php?search=%search_string%",
			"a16": "/torrents.php?imdb=%tt%",
			"a17": "/requests.php?search=%search_string%",
			"a18": "/index.php?page=torrents&search=%search_string%&category=0&options=0&active=0",
			"a19": "/foros/search.php?terms=any&author=&sc=1&sf=all&sr=posts&sk=t&sd=d&st=0&ch=300&t=0&submit=Search&keywords=%tt%",
			"a20": "/browse.php?search=%tt%",
			"a21": "/cocks/endoscope.php?what=imdb&q=%tt%",
			"a22": "/torrents.php?incldead=1&spstate=0&inclbookmarked=0&search_area=4&search_mode=0&search=%tt%",
			"a23": "/torrents-search.php?search=%search_string%",
			"a24": "/files/?query=%tt%",
			"a25": "/browse2.php?search=%tt%&wheresearch=2&incldead=1&polish=0&nuke=0&rodzaj=0",
			"a26": "/browse.php?stype=b&c23=1&c20=1&c42=1&c5=1&c19=1&c25=1&c6=1&c37=1&c43=1&c7=1&c9=1&advcat=0&incldead=0&includedesc=1&search=%tt%",
			"a27": "/search/?search=%search_string%+%year%",
			"a28": "/browse.php?blah=2&cat=0&incldead=1&search=%tt%",
			"a29": "/browse.php?view=0&c2=1&c1=1&c9=1&c11=1&c48=1&c8=1&c18=1&c49=1&c7=1&c38=1&c46=1&c5=1&c13=1&c26=1&c37=1&c19=1&c47=1&c17=1&c4=1&c22=1&c25=1&c20=1&c3=1&search=%tt%&searchtype=0",
			"a30": "/browse.php?view=0&search=%search_string%",
			"a31": "/browse.php?view=1&search=%tt%&searchtype=0",
			"a32": "/torrents.php?type=&userid=&searchstr=&searchimdb=%tt%&searchlang=&searchtags=&order_by=s3&order_way=desc&showOnly=#results",
			"a33": "/browse.php?c3=1&c1=1&c4=1&c2=1&imdb=%tt%",
			"a34": "/torrents.php?incldead=0&spstate=0&inclbookmarked=0&boardid=0&seeders=&search=%tt%&search_area=4&search_mode=2",
			"a35": "/browse.php?webdl=0&3d=0&search=&incldead=0&dsearch=%tt%",
			"a36": "/browse.php?search=%search_string%&blah=0&cat=0&incldead=1",
			"a37": "/torrents.php?incldead=1&search=%tt%&search_area=4&search_mode=0",
			"a38": "/torrents.php?cat402=1&cat403=1&incldead=1&search=%search_string%&search_area=0&search_mode=0",
			"a39": "/index.php?page=torrents&active=0&options=2&search=%nott%",
			"a40": "/torrents.php?active=0&options=2&search=%tt%",
			"a41": "/torrents.php?search=%tt%&search_area=4&search_mode=0",
			"a42": "/browse.php?incldead=1&searchin=2&search=%tt%",
			"a43": "/torrents/?q=%tt%",
			"a44": "/torrents/?q=%search_string%",
			"a45": "/browse.php?search_type=imdb&search=%nott%",
			"a46": "/browse.php?s=%search_string%+%year%&g=0&c=1002&v=0&d=0&w=0&t=0&f=0",
			"a47": "/browse.php?s=%search_string%+%year%&g=0&c=1001&v=0&d=0&w=0&t=0&f=0",
			"a48": "/movie.php?incldead=1&spstate=0&inclbookmarked=0&search=%tt%&search_area=4&search_mode=2",
			"a49": "/browse.php?search=%search_string%&title=0&cat=0",
			"a50": "/torrents.php?searchstr=%search_string%+%year%&tags_type=1&order_by=time&order_way=desc&group_results=1&filter_cat%5B1%5D=1&action=basic&searchsubmit=1",
			"a51": "/torrents.php?searchstr=%search_string%&tags_type=1&order_by=time&order_way=desc&group_results=1&filter_cat%5B2%5D=1&action=basic&searchsubmit=1",
			"a52": "/forum/tracker.php?nm=%search_string%+%year%",
			"a53": "/browse.php?incldead=1&fullsearch=0&scenerelease=0&imdbsearch=%tt%&imdb_from=0&imdb_to=0&search=",
			"a54": "/torrents.php?order_by=time&order_way=desc&searchtext=%search_string%&search_type=0&taglist=&tags_type=0",
			"a55": "/browseold.php?incldead=1&_by=3&search=%tt%",
			"a56": "/requests.php?submit=true&search=%tt%",
			"a57": "/torrents.php?groupname=&year=&tmdbover=&tmdbunder=&tmdbid=&imdbover=&imdbunder=&imdbid=%tt%&order_by=time&order_way=desc&taglist=&tags_type=1&filterTorrentsButton=Filter+Torrents",
			"a58": "/api/v1/torrents?extendedSearch=false&hideOld=false&index=0&limit=15&order=asc&page=search&searchText=%tt%&sort=n#",
			"a59": "/browse.php?search=%search_string%&cat=0&incldead=1&titleonly=1",
			"a60": "/forum/tracker.php?nm=%search_string%",
			"a61": "/search/0/0/010/0/%tt%",
			"a62": "/search.php?action=search&show_as=topics&keywords=%tt%",
			"a63": "/browse.php?c6=1&c3=1&c1=1&c4=1&c5=1&c2=1&m1=1&incldead=0&from=&to=&imdbgt=0&imdblt=10&uppedby=&imdb=&search=%tt%",
			"a64": "/search.php?stext=%tt%",
			"a65": "/torrent/torrents-search.php?search=%search_string%",
			"a66": "/browse.php?search=%search_string%&cata=yes&c29=1&c30=1&c25=1&c11=1&c5=1&c3=1&c21=1&c22=1&c13=1&c44=1&c1=1&c24=1&c32=1&c31=1&c33=1&c46=1&c14=1&c26=1&c7=1&c2=1",
			"a67": "/browse.php?incldead=0&country=&nonboolean=1&search=%tt%",
			"a68": "/torrents.php?action=basic&searchstr=%tt%",
			"a69": "/browse.php?search=%tt%&cat=0&incldead=1",
			"a70": "/browse.php?srchdtls=1&incldead=1&search=%tt%",
			"a71": "/torrents/browse/index/query/%search_string%+%year%/categories/1,8,9,10,11,12,13,14,15,29",
			"a72": "/torrents/browse/index/query/%search_string%/categories/2,26,27,32",
			"a73": "/search/%tt%",
			"a74": "/torrents.php?action=advanced&searchstr=&searchtags=&tags_type=1&groupdesc=&imdbid=%tt%&refsiteid=&torrentname=&torrentdesc=&filelist=&container=notselected&format=notselected&aformat=notselected&media=notselected&excludecontainer=notselected&order_by=s3&order_way=desc",
			"a75": "/torrents.php?searchstr=%search_string%",
			"a76": "/torrents.php?action=advanced&groupname=%tt%",
			"a77": "/browse.php?incldead=0&xtype=0&stype=3&search=%tt%",
			"a78": "/en/search/imdbid-%tt%",
			"a79": "/results?search_query=\"%search_string%\"+%year%+trailer",
			"a80": "/search/?search=%search_string%",
			"a81": "/?search=%search_string%&type=films",
			"a82": "/search/movies/?query=%tt%",
			"a83": "/imdb/%nott%",
			"a84": "/subtitles/title?q=%search_string%",
			"a85": "/%nott%/Movie/Releases/English/",
			"a86": "/w/index.php?search=%search_string%&go=Go",
			"a87": "/en/advsearch.php?stext=%search_string%&stype[]=title&fromyear=%year%&toyear=%year%",
			"a88": "/search/all/%search_string%/results?cats[movie]=1&cats[tv]=1&search_type=advanced&sort=relevancy",
			"a89": "/search/movie/%search_string%",
			"a90": "/search/tv/%search_string%",
			"a91": "/search/movies/%search_string%",
			"a92": "/search/str/%search_string%/keywords_pages",
			"a93": "/s/ref=nb_sb_noss?url=search-alias%3Dmovies-tv&field-keywords=%search_string%",
			"a94": "/search/%search_string%",
			"a95": "/search/?quicksearch=1&quicksearch_country=all&quicksearch_keyword=%search_string%+&section=bluraymovies",
			"a96": "/search?query=%search_string%"
		},
		"errorDic": {
			"allocN": 40,
			"a1": "Not logged in!",
			"a2": "<h1>Not logged in!</h1>",
			"a3": "<h1>You need cookies enabled to log in.</h1>",
			"a4": "<h2>Error 404</h2>",
			"a5": "You will be banned for 6 hours after your login attempts run out",
			"a6": "Please login or Register a personal account to access our user area and great community",
			"a7": "Error 404",
			"a8": "Lost your password?",
			"a9": "not authorized to view the Torrents",
			"a10": "You will be banned for 6 hours after your login attempts run out.",
			"a11": "<b>No torrents found</b>",
			"a27": "We are currently performing the daily site maintenance.<br>",
			"a28": "You need cookies enabled to log in",
			"a29": "Email:hdsky.me@gmail.com",
			"a30": "You need cookies enabled to log in or switch language",
			"a31": "<h1 style=\"color:yellow\">No Torrents Found!",
			"a32": "<h1>If you want the love</h1>",
			"a33": "<h1>Keep me logged in.</h1>",
			"a34": "You do not have permission to view these forums.",
			"a35": "You need to be logged in to view this page",
			"a36": "The page you tried to view can only be used when you're logged in",
			"a37": "Signup With Invite",
			"a38": "<h1>Forgot your password?</h1>",
			"a39": "<title>MySpleen :: Login</title>"
		},
		"noneDic": {
			"allocN": 50,
			"a1": "Your search returned zero results",
			"a2": "Your search did not match anything.",
			"a3": "Your search did not match anything",
			"a4": "class=\"overlay-container\"",
			"a5": "Your search was way too l33t",
			"a6": "Nothing found",
			"a7": "Ничего не найдено",
			"a8": "Nothing found!",
			"a9": "<h2>No match!</h2>",
			"a10": "Try again with a refined search string",
			"a11": "Nothing found!</h2>",
			"a12": ">Av.</td>s*</tr>s*</table>",
			"a13": "You must specify at least one word to search for. Each word must consist of at least 3 characters and must not contain more than 14 characters excluding wildcards.",
			"a14": "Disculpe",
			"a15": "<h2>Nothing found!</h2>",
			"a16": "Nothing Found</div>",
			"a17": "Nic tutaj nie ma!</h2>",
			"a18": "Try again with a refined search string.",
			"a19": "<h1>Note: Vous devez activer vos 'cookies' pour pouvoir vous identifier.</h1>",
			"a20": "total <b>0</b> torrents found",
			"a21": "<h2>Nu s-a găsit nimic!</h2>",
			"a22": "Try again with a different search string?",
			"a23": "<h2>Din søgning gav intet resultat.</h2>",
			"a24": "Nothing here!",
			"a25": "Nothing found! Try again with a refined search string.",
			"a26": "Nothing was found",
			"a27": "Нічого не знайдено",
			"a28": "Nothing found! Try again with a refined search string",
			"a29": "No torrents here...",
			"a30": "<h2>No torrents found",
			"a31": "Нет активных раздач, приносим извинения. Пожалуйста, уточните параметры поиска",
			"a32": "<strong>Nothing found!</strong>",
			"a34": "<h2>Your search did not match anything.</h2>",
			"a35": "Не найдено",
			"a36": "<h3>Ingenting her!</h3>",
			"a37": "^$",
			"a38": "//dyncdn.me/static/20/images/imdb_thumb.gif",
			"a39": "Результатов поиска 0",
			"a40": "There was a problem executing the query",
			"a41": "Your search returned no hits.",
			"a42": "<h2>No torrents found!</h2>",
			"a43": "0 Movies found matching search criteria",
			"a44": "No torrents were found based on your search criteria.",
			"a45": "<h2>No Search Results, try reducing your search options.",
			"a46": "<b>Nothing Found</b>",
			"a47": "Please refine your search.",
			"a48": "No hits. Try adding an asterisk in you search phrase.</h2>",
			"a49": "Nothing found</h2>"
		},
		"sites": [{
				"name": "ADC",
				"host": "https://asiandvdclub.org",
				"show": false,
				"noneInxs": ["a1"],
				"errorInxs": ["a3"],
				"searchInx": "a1"
			}, {
				"name": "AHD",
				"host": "https://awesome-hd.me",
				"show": false,
				"noneInxs": ["a2"],
				"errorInxs": ["a4"],
				"searchInx": "a2"
			}, {
				"name": "AR",
				"host": "https://alpharatio.cc",
				"show": false,
				"noneInxs": ["a3"],
				"errorInxs": [],
				"searchInx": "a3"
			}, {
				"name": "AR",
				"host": "https://alpharatio.cc",
				"TV": true,
				"show": false,
				"noneInxs": ["a3"],
				"errorInxs": [],
				"searchInx": "a4"
			}, {
				"name": "AT",
				"host": "https://avistaz.to",
				"positiveMatch": true,
				"show": false,
				"noneInxs": ["a4"],
				"errorInxs": [],
				"searchInx": "a5"
			}, {
				"name": "AT",
				"host": "https://avistaz.to",
				"positiveMatch": true,
				"TV": true,
				"show": false,
				"noneInxs": ["a4"],
				"errorInxs": [],
				"searchInx": "a6"
			}, {
				"name": "Blutopia",
				"host": "https://blutopia.xyz",
				"show": false,
				"noneInxs": ["a4"],
				"errorInxs": [],
				"searchInx": "a7"
			}, {
				"name": "bB",
				"host": "https://baconbits.org",
				"show": false,
				"noneInxs": ["a5"],
				"errorInxs": ["a5"],
				"searchInx": "a8"
			}, {
				"name": "bB",
				"host": "https://baconbits.org",
				"TV": true,
				"show": false,
				"noneInxs": ["a5"],
				"errorInxs": ["a5"],
				"searchInx": "a9"
			}, {
				"name": "BB-HD",
				"host": "https://bluebird-hd.org",
				"show": false,
				"noneInxs": ["a6", "a7"],
				"errorInxs": [],
				"searchInx": "a10"
			}, {
				"name": "BHD",
				"host": "https://beyondhd.xyz",
				"show": false,
				"noneInxs": ["a8"],
				"errorInxs": ["a6"],
				"searchInx": "a11"
			}, {
				"name": "BHD",
				"host": "https://beyondhd.xyz",
				"TV": true,
				"show": false,
				"noneInxs": ["a8"],
				"errorInxs": ["a6"],
				"searchInx": "a12"
			}, {
				"name": "BitHD",
				"host": "http://www.bit-hdtv.com",
				"show": false,
				"noneInxs": ["a9"],
				"errorInxs": [],
				"searchInx": "a13"
			}, {
				"name": "BitHQ",
				"host": "http://www.bithq.org",
				"show": false,
				"noneInxs": ["a10"],
				"errorInxs": ["a2"],
				"searchInx": "a14"
			}, {
				"name": "BMTV",
				"host": "https://www.bitmetv.org",
				"TV": true,
				"show": false,
				"noneInxs": ["a11"],
				"errorInxs": [],
				"searchInx": "a15"
			}, {
				"name": "BTN",
				"host": "https://broadcasthe.net",
				"TV": true,
				"show": false,
				"noneInxs": [],
				"errorInxs": ["a7", "a8"],
				"searchInx": "a16"
			}, {
				"name": "BTN-Req",
				"host": "https://broadcasthe.net",
				"TV": true,
				"show": false,
				"noneInxs": ["a6"],
				"errorInxs": ["a8"],
				"searchInx": "a17"
			}, {
				"name": "CaCh",
				"host": "http://www.cartoonchaos.org",
				"show": false,
				"noneInxs": ["a12"],
				"errorInxs": ["a9"],
				"searchInx": "a18"
			}, {
				"name": "CC",
				"host": "http://www.cine-clasico.com",
				"show": false,
				"noneInxs": ["a13", "a14"],
				"errorInxs": ["a10"],
				"searchInx": "a19"
			}, {
				"name": "CG",
				"host": "https://cinemageddon.net",
				"loggedOutRegex": "Not logged in!",
				"show": false,
				"noneInxs": ["a15"],
				"errorInxs": ["a1"],
				"searchInx": "a20"
			}, {
				"name": "CG-c",
				"host": "https://cinemageddon.net",
				"loggedOutRegex": "Not logged in!",
				"show": false,
				"noneInxs": ["a15"],
				"errorInxs": ["a1"],
				"searchInx": "a21"
			}, {
				"name": "CHD",
				"host": "https://chdbits.co",
				"show": false,
				"noneInxs": ["a6"],
				"errorInxs": [],
				"searchInx": "a22"
			}, {
				"name": "Classix",
				"host": "http://classix-unlimited.co.uk",
				"show": false,
				"noneInxs": ["a16"],
				"errorInxs": [],
				"searchInx": "a23"
			}, {
				"name": "Demnoid",
				"host": "http://www.demonoid.pw",
				"show": false,
				"noneInxs": [],
				"errorInxs": ["a11", "a27"],
				"searchInx": "a24"
			}, {
				"name": "DVDSeed",
				"host": "http://www.dvdseed.eu",
				"show": false,
				"noneInxs": ["a17"],
				"errorInxs": [],
				"searchInx": "a25"
			}, {
				"name": "ET",
				"host": "https://cinemaz.to",
				"positiveMatch": true,
				"show": false,
				"noneInxs": ["a4"],
				"errorInxs": [],
				"searchInx": "a5"
			}, {
				"name": "ET",
				"host": "https://cinemaz.to",
				"positiveMatch": true,
				"TV": true,
				"show": false,
				"noneInxs": ["a4"],
				"errorInxs": [],
				"searchInx": "a6"
			}, {
				"name": "eThor",
				"host": "http://ethor.net",
				"show": false,
				"noneInxs": ["a18", "a19"],
				"errorInxs": [],
				"searchInx": "a26"
			}, {
				"name": "ExtraTorrent",
				"host": "https://extratorrent.cc",
				"show": false,
				"noneInxs": ["a20"],
				"errorInxs": [],
				"searchInx": "a27"
			}, {
				"name": "FL",
				"host": "https://filelist.ro",
				"show": false,
				"noneInxs": ["a21"],
				"errorInxs": [],
				"searchInx": "a20"
			}, {
				"name": "FSS",
				"host": "http://fss.omnilounge.co.uk",
				"show": false,
				"noneInxs": ["a22"],
				"errorInxs": ["a3"],
				"searchInx": "a28"
			}, {
				"name": "GFT",
				"host": "https://www.thegft.org",
				"show": false,
				"noneInxs": ["a11"],
				"errorInxs": [],
				"searchInx": "a29"
			}, {
				"name": "GFT",
				"host": "https://www.thegft.org",
				"TV": true,
				"show": false,
				"noneInxs": ["a11"],
				"errorInxs": [],
				"searchInx": "a30"
			}, {
				"name": "GFT-Gems",
				"host": "https://www.thegft.org",
				"show": false,
				"noneInxs": ["a11"],
				"errorInxs": [],
				"searchInx": "a31"
			}, {
				"name": "HD",
				"host": "http://hounddawgs.org",
				"show": false,
				"noneInxs": ["a23"],
				"errorInxs": [],
				"searchInx": "a32"
			}, {
				"name": "HDb",
				"host": "https://hdbits.org",
				"show": false,
				"noneInxs": ["a24"],
				"errorInxs": ["a28"],
				"searchInx": "a33"
			}, {
				"name": "HDC",
				"host": "https://hdchina.club",
				"show": false,
				"noneInxs": ["a25"],
				"errorInxs": [],
				"searchInx": "a34"
			}, {
				"name": "HDClub",
				"host": "http://hdclub.org",
				"show": false,
				"noneInxs": ["a26", "a7", "a27"],
				"errorInxs": [],
				"searchInx": "a35"
			}, {
				"name": "HDME",
				"host": "https://hdme.eu",
				"show": false,
				"noneInxs": ["a18"],
				"errorInxs": ["a3"],
				"searchInx": "a28"
			}, {
				"name": "HDME",
				"host": "https://hdme.eu",
				"TV": true,
				"show": false,
				"noneInxs": ["a18"],
				"errorInxs": ["a3"],
				"searchInx": "a36"
			}, {
				"name": "HDS",
				"host": "https://hdsky.me",
				"show": false,
				"noneInxs": ["a28"],
				"errorInxs": ["a29"],
				"searchInx": "a37"
			}, {
				"name": "HDS",
				"host": "https://hdsky.me",
				"TV": true,
				"show": false,
				"noneInxs": ["a28"],
				"errorInxs": ["a29"],
				"searchInx": "a38"
			}, {
				"name": "HDSpace",
				"host": "https://hd-space.org",
				"icon": "http://www.favicon.by/ico/5991df36e3635.ico",
				"show": false,
				"searchInx": "a39"
			}, {
				"name": "HDT",
				"host": "http://hd-torrents.org",
				"icon": "https://hdts.ru/favicon.ico",
				"show": false,
				"noneInxs": ["a29"],
				"errorInxs": [],
				"searchInx": "a40"
			}, {
				"name": "HDVN",
				"host": "http://torviet.com",
				"show": false,
				"noneInxs": ["a28"],
				"errorInxs": ["a30"],
				"searchInx": "a41"
			}, {
				"name": "ILC",
				"host": "http://www.iloveclassics.com",
				"show": false,
				"noneInxs": ["a10"],
				"errorInxs": ["a2"],
				"searchInx": "a42"
			}, {
				"name": "IPT",
				"host": "https://www.iptorrents.com",
				"show": false,
				"noneInxs": [],
				"errorInxs": ["a31"],
				"searchInx": "a43"
			}, {
				"name": "IPT",
				"host": "https://www.iptorrents.com",
				"TV": true,
				"show": false,
				"noneInxs": [],
				"errorInxs": ["a31"],
				"searchInx": "a44"
			}, {
				"name": "KG",
				"host": "https://karagarga.in",
				"show": false,
				"noneInxs": ["a30"],
				"errorInxs": ["a32"],
				"searchInx": "a45"
			}, {
				"name": "KZ",
				"host": "http://kinozal.tv",
				"show": false,
				"noneInxs": ["a31"],
				"errorInxs": [],
				"searchInx": "a46"
			}, {
				"name": "KZ",
				"host": "http://kinozal.tv",
				"TV": true,
				"show": false,
				"noneInxs": ["a31"],
				"errorInxs": [],
				"searchInx": "a47"
			}, {
				"name": "M-T",
				"host": "https://tp.m-team.cc",
				"show": false,
				"noneInxs": ["a24", "a18"],
				"errorInxs": [],
				"searchInx": "a48"
			}, {
				"name": "MS",
				"host": "http://www.myspleen.org",
				"show": false,
				"noneInxs": ["a32"],
				"errorInxs": ["a39"],
				"searchInx": "a49"
			}, {
				"name": "MTV",
				"host": "https://www.morethan.tv",
				"show": false,
				"noneInxs": ["a34"],
				"errorInxs": [],
				"searchInx": "a50"
			}, {
				"name": "MTV",
				"host": "https://www.morethan.tv",
				"TV": true,
				"show": false,
				"noneInxs": ["a34"],
				"errorInxs": [],
				"searchInx": "a51"
			}, {
				"name": "NNM",
				"host": "https://nnm-club.me",
				"show": false,
				"noneInxs": ["a35"],
				"errorInxs": [],
				"searchInx": "a52"
			}, {
				"name": "NB",
				"host": "https://norbits.net",
				"show": false,
				"noneInxs": ["a36"],
				"errorInxs": [],
				"searchInx": "a53"
			}, {
				"name": "NBL",
				"host": "https://nebulance.io",
				"TV": true,
				"show": false,
				"noneInxs": ["a3"],
				"errorInxs": [],
				"searchInx": "a54"
			}, {
				"name": "PHD",
				"host": "https://privatehd.to",
				"positiveMatch": true,
				"show": false,
				"noneInxs": ["a4"],
				"errorInxs": [],
				"searchInx": "a5"
			}, {
				"name": "PHD",
				"host": "https://privatehd.to",
				"positiveMatch": true,
				"TV": true,
				"show": false,
				"noneInxs": ["a4"],
				"errorInxs": [],
				"searchInx": "a6"
			}, {
				"name": "PTN",
				"host": "https://piratethenet.org",
				"icon": "https://piratethenet.org/pic/favicon.ico",
				"show": false,
				"noneInxs": ["a8"],
				"errorInxs": [],
				"searchInx": "a55"
			}, {
				"name": "PTP",
				"host": "https://passthepopcorn.me",
				"show": false,
				"noneInxs": ["a34"],
				"errorInxs": [],
				"searchInx": "a16"
			}, {
				"name": "PTP-Req",
				"host": "https://passthepopcorn.me",
				"show": false,
				"noneInxs": ["a2"],
				"errorInxs": ["a33"],
				"searchInx": "a56"
			}, {
				"name": "PxHD",
				"host": "https://pixelhd.me",
				"show": false,
				"noneInxs": ["a34"],
				"errorInxs": [],
				"searchInx": "a57"
			}, {
				"name": "RARAT",
				"goToUrl": "/search?search=%tt%",
				"show": false,
				"host": "https://rarat.org",
				"noneInxs": ["a37"],
				"errorInxs": [],
				"searchInx": "a58"
			}, {
				"name": "RARBG",
				"positiveMatch": true,
				"show": false,
				"host": "https://rarbg.to",
				"noneInxs": ["a38"],
				"errorInxs": [],
				"searchInx": "a16"
			}, {
				"name": "RevTT",
				"show": false,
				"host": "https://www.revolutiontt.me",
				"noneInxs": ["a15"],
				"errorInxs": [],
				"searchInx": "a20"
			}, {
				"name": "RevTT",
				"TV": true,
				"show": false,
				"host": "https://www.revolutiontt.me",
				"noneInxs": ["a15"],
				"errorInxs": [],
				"searchInx": "a59"
			}, {
				"name": "RuT",
				"show": false,
				"host": "https://rutracker.org",
				"noneInxs": ["a35"],
				"errorInxs": [],
				"searchInx": "a60"
			}, {
				"name": "Rutor",
				"show": false,
				"host": "http://rutor.info",
				"noneInxs": ["a39"],
				"errorInxs": [],
				"searchInx": "a61"
			}, {
				"name": "SC",
				"show": false,
				"host": "http://www.secret-cinema.net",
				"noneInxs": ["a18", "a40"],
				"errorInxs": [],
				"searchInx": "a15"
			}, {
				"name": "SC-F",
				"show": false,
				"host": "http://www.secret-cinema.net",
				"noneInxs": ["a41"],
				"errorInxs": ["a34"],
				"searchInx": "a62"
			}, {
				"name": "SDBits",
				"show": false,
				"host": "http://sdbits.org",
				"noneInxs": ["a8"],
				"errorInxs": ["a3"],
				"searchInx": "a63"
			}, {
				"name": "sHD",
				"show": false,
				"host": "https://scenehd.org",
				"noneInxs": ["a42"],
				"errorInxs": [],
				"searchInx": "a20"
			}, {
				"name": "SM",
				"show": false,
				"host": "https://surrealmoviez.info",
				"noneInxs": ["a43"],
				"errorInxs": ["a35"],
				"searchInx": "a64"
			}, {
				"name": "TBD",
				"icon": "https://1.bp.blogspot.com/-F2JeKtPCJYI/VgjpVxwMO4I/AAAAAAAAADg/VyNyp-yW9Ac/s1600/TBD.ico",
				"show": false,
				"host": "http://www.torrentbd.com",
				"noneInxs": ["a44"],
				"errorInxs": [],
				"searchInx": "a65"
			}, {
				"name": "TD",
				"show": false,
				"host": "https://www.torrentday.com",
				"noneInxs": ["a8"],
				"errorInxs": [],
				"searchInx": "a66"
			}, {
				"name": "TE",
				"show": false,
				"host": "http://theempire.bz",
				"noneInxs": ["a10"],
				"errorInxs": ["a3"],
				"searchInx": "a67"
			}, {
				"name": "TehC",
				"show": false,
				"host": "https://tehconnection.eu",
				"noneInxs": ["a45"],
				"errorInxs": ["a10"],
				"searchInx": "a68"
			}, {
				"name": "TG",
				"show": false,
				"host": "https://thegeeks.bz",
				"noneInxs": ["a10"],
				"errorInxs": ["a3"],
				"searchInx": "a67"
			}, {
				"name": "RS",
				"host": "http://rareshare.me",
				"postUrl": "/browse.php",
				"goToUrl": "/browse.php?tt=%nott%",
				"postData": {
					"do": "search",
					"keywords": "%tt%",
					"search_type": "t_genre",
					"category": "0",
					"include_dead_torrents": "yes"
				},
				"loggedOutRegex": "<h1>Not logged in!</h1>",
				"show": false,
				"searchInx": "",
				"noneInxs": ["a46"],
				"errorInxs": ["a2"]
			}, {
				"name": "THC",
				"show": false,
				"host": "https://horrorcharnel.org",
				"noneInxs": ["a15"],
				"errorInxs": ["a2"],
				"searchInx": "a69"
			}, {
				"name": "Tik",
				"show": false,
				"host": "http://cinematik.net",
				"noneInxs": ["a15"],
				"errorInxs": ["a36"],
				"searchInx": "a70"
			}, {
				"name": "TL",
				"show": false,
				"host": "http://www.torrentleech.org",
				"noneInxs": ["a47"],
				"errorInxs": ["a37"],
				"searchInx": "a71"
			}, {
				"name": "TL",
				"TV": true,
				"show": false,
				"host": "http://www.torrentleech.org",
				"noneInxs": ["a47"],
				"errorInxs": ["a37"],
				"searchInx": "a72"
			}, {
				"name": "TPB",
				"show": false,
				"host": "https://thepiratebay.org",
				"noneInxs": ["a48"],
				"errorInxs": [],
				"searchInx": "a73"
			}, {
				"name": "TVV",
				"show": false,
				"host": "http://tv-vault.me",
				"noneInxs": ["a49"],
				"errorInxs": [],
				"searchInx": "a74"
			}, {
				"name": "TVV2",
				"TV": true,
				"show": false,
				"host": "http://tv-vault.me",
				"noneInxs": ["a49"],
				"errorInxs": [],
				"searchInx": "a75"
			}, {
				"name": "UHDB",
				"show": false,
				"host": "https://uhdbits.org",
				"noneInxs": ["a2"],
				"errorInxs": [],
				"searchInx": "a76"
			}, {
				"name": "x264",
				"show": false,
				"host": "http://x264.me",
				"noneInxs": ["a18"],
				"errorInxs": ["a38"],
				"searchInx": "a77"
			}, {
				"name": "OpenSubtitles",
				"auto": false,
				"show": false,
				"host": "http://www.opensubtitles.org",
				"searchInx": "a78"
			}, {
				"name": "YouTube.com",
				"auto": false,
				"show": false,
				"host": "https://www.youtube.com",
				"searchInx": "a79"
			}, {
				"name": "Rotten Tomatoes",
				"auto": false,
				"show": false,
				"host": "https://www.rottentomatoes.com",
				"searchInx": "a80"
			}, {
				"name": "Criticker",
				"auto": false,
				"show": false,
				"host": "https://www.criticker.com",
				"searchInx": "a81"
			}, {
				"name": "iCheckMovies",
				"auto": false,
				"show": false,
				"host": "https://www.icheckmovies.com",
				"searchInx": "a82"
			}, {
				"name": "Letterboxd",
				"auto": false,
				"show": false,
				"host": "http://letterboxd.com",
				"searchInx": "a83"
			}, {
				"name": "Subscene",
				"auto": false,
				"show": false,
				"host": "http://subscene.com",
				"searchInx": "a84"
			}, {
				"name": "SubtitleSeeker",
				"auto": false,
				"show": false,
				"host": "http://www.subtitleseeker.com",
				"searchInx": "a85"
			}, {
				"name": "Wikipedia",
				"auto": false,
				"show": false,
				"host": "https://en.wikipedia.org",
				"searchInx": "a86"
			}, {
				"name": "FilmAffinity",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.filmaffinity.com",
				"searchInx": "a87"
			}, {
				"name": "Metacritic",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.metacritic.com",
				"searchInx": "a88"
			}, {
				"name": "Can I Stream.It? (Movie)",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.canistream.it",
				"searchInx": "a89"
			}, {
				"name": "Can I Stream.It? (TV)",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.canistream.it",
				"searchInx": "a90"
			}, {
				"name": "AllMovie",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.allmovie.com",
				"searchInx": "a91"
			}, {
				"name": "Facebook",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "https://www.facebook.com",
				"searchInx": "a92"
			}, {
				"name": "Amazon",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.amazon.com",
				"searchInx": "a93"
			}, {
				"name": "Netflix",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.netflix.com",
				"searchInx": "a94"
			}, {
				"name": "Blu-ray.com",
				"auto": false,
				"showByDefault": false,
				"show": false,
				"host": "http://www.blu-ray.com",
				"searchInx": "a95"
			}, {
				"name": "trakt.tv",
				"auto": false,
				"icon": "https://walter.trakt.tv/hotlink-ok/public/favicon.ico",
				"showByDefault": false,
				"show": false,
				"host": "https://trakt.tv",
				"searchInx": "a96"
			}
		]
	};
	var getConfigFldDefns = function( iMod ) {
		// non site specific fields
		var configFldDefns = {
		'imdbscout_header_text': {
			'label': 'Header text:',
			'type': 'text',
			'default': 'Pirate this film: '
			},
		'sticky_notes': {
			'type': 'checkbox',
			'label': 'Store note on titles',
			'default': true
			},
		'enhance_torrent_pages': {
			'type': 'checkbox',
			'label': 'Enhance torrent site pages',
			'default': true
			},
		'enhance_all_pages': {
			'type': 'checkbox',
			'label': 'Enhance all pages',
			'default': false
			},
		'call_http': {
			'type': 'checkbox',
			'label': 'Actually check for torrents?',
			'default': true
			},
		'use_icons': {
			'type': 'checkbox',
			'label': 'Use icons instead of text?',
			'default': false
			}
		};
		var index,site,startedB = false, sectionS = '';
		// Add each site to a appConfig dictionary schema
		// The appConfig default for checkboxes is false
		for ( index=0; (site=iMod.appConfig.siteMap.sites[index])!==undefined; index++ ) {
			if ( site.auto === false ) { // true if undefined
				sectionS = '';
				if ( startedB === false ) {
					startedB = true;
					sectionS = ['Unchecked sites:'];
				}
				configFldDefns['show_icon_' + site.name] = {
				'section': sectionS, // (index === 0) ? ['Unchecked sites:'] : '',
				'type': 'checkbox',
				'label': ' ' + site.name,
				'default': ('showByDefault' in site) ?
					site.showByDefault : true
				};
			} else {
				configFldDefns['show_' + site.name + (site.TV ? '_TV' : '')] = {
				'section': (index === 0) ? ['Checked sites:'] : '',
				'type': 'checkbox',
				'label': ' ' + site.name + (site.TV ? ' (TV)' : '')
				};
			}
		}
		// Icon sites should be shown by default though,
		// since they barely use any resources.
		// $.each(icon_sites, function(index, icon_site) {
/*
		for ( index=0; (icon_site=icon_sites[index])!==undefined; index++ ) {
			configFldDefns['show_icon_' + icon_site.name] = {
			'section': (index === 0) ? ['Other sites:'] : '',
			'type': 'checkbox',
			'label': ' ' + icon_site.name,
			'default': ('showByDefault' in icon_site) ?
				icon_site.showByDefault : true
			};
		}
*/
		return configFldDefns;
	};
	var appConfig = {
		store: {}, // config stuff
		imdbs: {}, // cache of results indexed by movieId, per imdb movie Id
		notes: {}, // notes, per imdb movie Id
//		extrasites: {}, // user supplied sites 
		get:function( iKey ) {
			return this.store[iKey];
		},
		saveNamed:function( iDbS, iFn ) {
			var onStore = function() {
				console.log( JSON.stringify( aObj ) );
				iFn();
			};
			var onErrorB = function() {
				alert( 'error ' + iDbS + ' NOT saved' );
			};
			var aObj = { };
			aObj[iDbS] = this[iDbS];
			var bPromise = browser.storage.local.set( aObj );
			bPromise.then(onStore, onErrorB);
		},
		reload: function( iDbS, iDoneFn ) {
//			console.log( 'reload ' + iDbS );
			var aConfig = this;
			var onError = function( ) {
				console.error('imdb store failed');
			};
			var onOk = function( iStore ) {
				aConfig[ iDbS ] = iStore[ iDbS ];
				iDoneFn();
			};
			var aPromise = browser.storage.local.get( [ iDbS ] );
			aPromise.then(onOk, onError);
		},
/*
		saveExtrasites:function( iFn ) {
			var onStore = function() {
				iFn();
			};
			var onErrorB = function() {
				alert( 'error extrasites NOT saved' );
			};
			var aObj = { extrasites: this.extrasites };
			var bPromise = browser.storage.local.set( aObj );
			bPromise.then(onStore, onErrorB );
		}
*/
	};
	var makeDefaultConfig = function( iConfigFields ) {
		var config = {}, inx, fld;
		for ( inx in iConfigFields ) {
			if ( iConfigFields.hasOwnProperty( inx ) ) {
				fld = iConfigFields[ inx ];
				if ( fld.default !== undefined ) {
					config[inx] = fld.default;
				} else {
					config[inx] = false;
				}
			}
		}
		return config;
	};
	var setShowAsPerConfig = function( iMod ) {
		// Fetch per-site values from mSites.appConfig
		var j,nxSite;
		for ( j=0; (nxSite=iMod.appConfig.siteMap.sites[j])!==undefined; j++ ) {
			if ( nxSite.auto !== false ) {
				nxSite.show = appConfig.get('show_' + nxSite.name + (nxSite.TV ? '_TV' : ''));
			} else {
				nxSite.show = appConfig.get('show_icon_' + nxSite.name);
			}
		}
	};
	var findInx = function( iObj, iS ) {
		var inx, rInx = '';
		for ( inx in iObj ) {
			if ( iObj.hasOwnProperty( inx ) ) {
				if ( inx !== 'allocN' ) {
					if ( iObj[inx] === iS ) {
						rInx = inx;
					}
				}
			}
		}
		return rInx;
	};
	var setupConfig = function( iMod, iFn ) {
		function onGot(item) { // data from local store
			var configFldDefns, inx, inx2, j, nxSite, hostS, bSs, cSs, k, nxS, matchSs;
	//		alert( 'configuration found:' + JSON.stringify(item)  );
			if ( item.scoutConfig === undefined ) { // first use set config to default
				configFldDefns = getConfigFldDefns( iMod );
	//			alert( 'no scoutConfig' );
				appConfig.store = makeDefaultConfig( configFldDefns );
				// save config to local store, continue on success
				var aObj = { scoutConfig: appConfig.store, imdbs:{}, notes:{} };
				var bPromise = browser.storage.local.set( aObj );
				iMod.appConfig.siteMap = siteMap;
				bPromise.then(onStore, onErrorB);
			} else {
				// set config from local store
				appConfig.store = item.scoutConfig;
//				console.log( JSON.stringify( appConfig.store ) );
				// set torrent site link info cache from local store
				if ( item.imdbs !== undefined ) {
					appConfig.imdbs = item.imdbs;
				} else {
					appConfig.imdbs = {};
				}
				// set title notes from local store
				if ( item.notes !== undefined ) {
					appConfig.notes = item.notes;
				} else {
					appConfig.notes = {};
				}
//				console.log( 'item.siteMap ' + JSON.stringify( item.siteMap ) );
				if ( item.siteMap !== undefined ) {
					iMod.appConfig.siteMap = item.siteMap;
				}
//				iMod.appConfig.siteMap.sites = mergeExtrasites();
				setShowAsPerConfig( iMod ); // set 'show' in sites database
				iFn( ); // continue
			}
//			console.log( JSON.stringify( iMod.appConfig.siteMap ) );
		}
		function onStore(item) {
			setShowAsPerConfig( iMod );
			iFn();
		}
		function onErrorB(error) {
			alert( 'onErrorB:' + error );
		}
		function onError(error) {
			alert( 'configuration not found:' + error );
		}
		var aPromise = browser.storage.local.get( ['scoutConfig','imdbs','notes','siteMap'] );
		aPromise.then(onGot, onError);
	};
	mod.resetSiteMap = function( iMod ) {
		iMod.appConfig.siteMap = siteMap;
	};
	appConfig.siteMap = siteMap;
	mod.makeDefaultConfig = makeDefaultConfig;
//	mod.icon_sites = icon_sites;
	mod.appConfig = appConfig;
	mod.setupConfig = setupConfig;
	mod.getConfigFldDefns = getConfigFldDefns;
	return mod;
};
var mSites = modSitesdb();

