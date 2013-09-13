/********************************************************************************
 * Name: flash-export
 * Description: exports one PNG image per frame in each flash file in a directory
 * Author: Jason R Brubaker
 * License: MIT
 ********************************************************************************/
 
var log = "";
var logURI = "";

(function(){
	// get the directory
	var dirURI = selectDir();
	if(!dirURI) throw new Error("Directory URI is not specified.");
    
	// initialize the log
    initLog(dirURI);
	
	// process the root directory
	try {
		processDir(dirURI);
		fl.openScript(logURI);
	}catch(err){
		var err_string = "Error: " + err.message + "\nOperation aborted in midstream.";
		appendLog(err_string);
		flushLog();
		alert(err_string);
	}
	
})();

// process a directory
function processDir(dirURI) {
	appendLog("*** Processing directory \"" + dirURI + "\" ***");
	
	// get list of files in the directory
	var fileNames = FLfile.listFolder(dirURI + "*.fla", "files");
  	if(!fileNames || !fileNames.length) throw new Error("There are no .flas in the selected directory.");
	appendLog("\tFound " + fileNames.length + " .fla files to process:");
	appendLog("\t\t" + fileNames.join("\n\t\t") + "\n");
	
	// loop through files & process each one
  	for(var i=0; i<fileNames.length; i++){
  	  processFile(dirURI, fileNames[i]);
  	}
  	
	// write log to file
  	flushLog();
}

// process a file
function processFile(dirURI, fileName) {
	var dot_index, doc, baseURI, ext, fileURI, tl;
	
	appendLog("\tProcessing " + fileName + ":");
	
	// get the baseURI
	baseURI = dirURI + fileName.substr(0, fileName.lastIndexOf("."));	

	// open a flash document
	doc = fl.openDocument(dirURI + fileName);
	
	// get the timeline and the frame count
    tl = doc.getTimeline();
	appendLog("\t\tExporting " + tl.frameCount + " .png files, one for each frame in " + fileName + ":");
	
	// loop through frames
	for(var i=0; i<tl.frameCount; i++){
		fileURI = baseURI + "-" + (i+1) + ".png";
		appendLog("\t\t\tExporting image '" + fileURI + "'");
		
		tl.currentFrame = i;
		try {
			doc.exportPNG(fileURI, true , true);
		} catch (err) {
			appendLog("Error exporting image: " + err.message);
		}
		
		flushLog();
	}
	
	appendLog("\t...finished\n");	
	flushLog();
}

// select the directory
function selectDir(){
  var retDirURI = null
  retDirURI = appendSlash(fl.browseForFolderURL("Choose a folder where your target .fla files are located."));
  return retDirURI;
}

// add a slash to the end of the string
function appendSlash(str){
  return (str.substr(-1) == "/") ? str : str + "/";
}

// initialize the log
function initLog(dirURI){
  log = "";
  logURI = dirURI + "log.txt";
  FLfile.write(logURI, "");
}

// append to log
function appendLog(str) {
	log += "\n"+ str;
	fl.trace(str);
}

// write log to file
function flushLog(){
  if(logURI){
    FLfile.write(logURI, log, "append");
	log = "";
  }
}
