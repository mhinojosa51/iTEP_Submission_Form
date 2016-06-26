/*

Description: Backend Javascript code for handling form submission data and creating student folders for document review.
Author: Michael Hinojosa

*/

function doGet() {
    return HtmlService.createHtmlOutputFromFile('iTEP_Form')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// sends an email response to a submitter letting them know which files they have submitted.
function sendMailResponse(submitted, email, name) {
    var response = 'Hello, ' + name + '\n\nThank you for your iTEP Submission. Your file submissions so far:\n';
    var submissions = ['Transcript', 'Other Transcripts', 'CBEST', 'CSET', 'Character Identification Clearance', 'TB Shot Verification', 'CPR Verification', 'Essay'];

    for (var i = 0; i < submitted.length; i++) {
        if (submitted[i] == 1) {
            response += '\n' + submissions[i] + ': Submitted';
        }
        else {
            response += '\n' + submissions[i] + ': Not Submitted';
        }

    }

    MailApp.sendEmail(email, 'iTEP File Submission Confirmation', response)

}

// gather data from a submitted form and submit it to a shared Google Folder for review by staff.
function gatherData(data) {
    var name = data['user-name'];
    var otterID = data['otter-id'];
    var phone = data['phone'];
    var studentEmail = data['user-email'];

    var gpaFile = data['gpa-file'];
    var transcriptFile = data['transcript-file'];
    var cbestFile = data['cbest-file'];
    var csetFile = data['cset-file'];
    var clearanceFile = data['clearance-file'];
    var diseaseFile = data['disease-file'];
    var cprFile = data['cpr-file'];
    var essayFile = data['essay-file'];

    var gpaSubmitted = data['gpa'];
    var transcriptSubmitted = data['transcript'];
    var cbestSubmitted = data['CBEST'];
    var csetSubmitted = data['CSET'];
    var clearanceSubmitted = data['clearance'];
    var diseaseSubmitted = data['disease'];
    var cprSubmitted = data['cpr'];
    var essaySubmitted = data['essay'];

    var files = [gpaFile, transcriptFile, cbestFile, csetFile, clearanceFile, diseaseFile, cprFile, essayFile];
    var submitted = [['Transcript', gpaSubmitted], ['Other Transcripts', transcriptSubmitted], ['CBEST', cbestSubmitted], ['CSET', csetSubmitted], ['CIC', clearanceSubmitted], ['TB Shot Verification', diseaseSubmitted],
                     ['CPR Verification', cprSubmitted], ['Essay', essaySubmitted]];

    var responses = [];


    var folder = DriveApp.getFolderById('YOUR_FOLDER_ID');

    // check to see if a student has previously submitted work, if so add submitted files to their folder if not, create a new folder with their submitted files
    try {
        var studentFolder = folder.getFoldersByName(name + ' Info').next();
    }
    catch (e) {
        folder.createFolder(name + ' Info');
        var studentFolder = folder.getFoldersByName(name + ' Info').next();
        var content = 'Applicant Name: ' + name + '\nOtterID: ' + otterID + '\nPhone Number: ' + phone + '\nEmail: ' + studentEmail;
        studentFolder.createFile(name + ' Info', content, MimeType.PLAIN_TEXT);
    }


    for (var i = 0; i < files.length; i++) {
        if (files[i].getContentType() != 'application/octet-stream' && submitted[i][1] == 'on') {
            responses.push(1);
            studentFolder.createFile(files[i]);
        }
        else {
            responses.push(0);
        }
    }

    folder.addFolder(studentFolder);

    // send a response to the submitter
    sendMailResponse(responses, studentEmail, name);
}