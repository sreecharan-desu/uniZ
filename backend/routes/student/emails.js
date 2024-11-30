"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetFailed = exports.passwordResetSuccess = exports.getOutingMailFormatForWarden = exports.getOutingMailFormatForStudent = exports.getOutpassMailFormatForWarden = exports.getOutpassMailFormatForStudent = void 0;
const getOutpassMailFormatForStudent = (outpass) => {
    var _a, _b, _c, _d, _e;
    const outPassEmailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .details {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Outpass Request</h1>
        <p>Your outpass request with ID: <strong>${(_a = outpass.outpass_details) === null || _a === void 0 ? void 0 : _a.id}</strong> is being sent to your warden. You will be notified via email once it is approved or rejected.</p>
        <div class="details">
            <p><strong>From Day:</strong> ${(_b = outpass.outpass_details) === null || _b === void 0 ? void 0 : _b.FromDay.toLocaleString().split("05:30:00")[0].split(",")[0]}</p>
            <p><strong>To Day:</strong> ${(_c = outpass.outpass_details) === null || _c === void 0 ? void 0 : _c.ToDay.toLocaleString().split("05:30:00")[0].split(",")[0]}</p>
            <p><strong>No. of Days:</strong> ${(_d = outpass.outpass_details) === null || _d === void 0 ? void 0 : _d.Days}</p>
            <p><strong>Time Requested:</strong> ${(_e = outpass.outpass_details) === null || _e === void 0 ? void 0 : _e.RequestedTime.toLocaleString().split("GMT")[0]}</p>
        </div>
        <div class="footer">
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>uniZ</p>
        </div>
    </div>
</body>
</html>
`;
    return outPassEmailBody;
};
exports.getOutpassMailFormatForStudent = getOutpassMailFormatForStudent;
const getOutpassMailFormatForWarden = (outpass, user) => {
    var _a, _b, _c, _d, _e;
    const wardenOutPassEmailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .details {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>A New Outpass Request from ${user.Username}</h1>
        <p><strong>Here are the details:</strong></p>
        <div class="details">
            <p><strong>Reason:</strong> ${(_a = outpass.outpass_details) === null || _a === void 0 ? void 0 : _a.Reason}</p>
            <p><strong>From Day:</strong> ${(_b = outpass.outpass_details) === null || _b === void 0 ? void 0 : _b.FromDay.toLocaleString().split("05:30:00")[0].split(",")[0]}</p>
            <p><strong>To Day:</strong> ${(_c = outpass.outpass_details) === null || _c === void 0 ? void 0 : _c.ToDay.toLocaleString().split("05:30:00")[0].split(",")[0]}</p>
            <p><strong>No. of Days:</strong> ${(_d = outpass.outpass_details) === null || _d === void 0 ? void 0 : _d.Days}</p>
            <p><strong>Time Requested:</strong> ${(_e = outpass.outpass_details) === null || _e === void 0 ? void 0 : _e.RequestedTime.toLocaleString().split("GMT")[0]}</p>
        </div>
        <p>Go to the website now to approve or reject requests...</p>
        <div class="footer">
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>uniZ</p>
        </div>
    </div>
</body>
</html>
`;
    return wardenOutPassEmailBody;
};
exports.getOutpassMailFormatForWarden = getOutpassMailFormatForWarden;
const getOutingMailFormatForStudent = (outing) => {
    var _a, _b, _c, _d, _e;
    const studentOutingEmailBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            background-color: #ffffff;
                            border-radius: 8px;
                            padding: 20px;
                            max-width: 600px;
                            margin: 0 auto;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #4CAF50;
                            font-size: 24px;
                            margin-top: 0;
                        }
                        p {
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 10px 0;
                        }
                        .details {
                            margin-top: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            background-color: #f9f9f9;
                        }
                        .details p {
                            margin: 5px 0;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 14px;
                            color: #888;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Your Outing Request</h1>
                        <p>Your outing request with ID: <strong>${(_a = outing.outing_details) === null || _a === void 0 ? void 0 : _a.id}</strong> is being sent to your warden. You will be notified via email once it is approved or rejected.</p>
                        <div class="details">
                            <p><strong>Reason:</strong> ${(_b = outing.outing_details) === null || _b === void 0 ? void 0 : _b.reason}</p>
                            <p><strong>From Time:</strong> ${(_c = outing.outing_details) === null || _c === void 0 ? void 0 : _c.FromTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                            <p><strong>To Time:</strong> ${(_d = outing.outing_details) === null || _d === void 0 ? void 0 : _d.ToTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                            <p><strong>Time Requested:</strong> ${(_e = outing.outing_details) === null || _e === void 0 ? void 0 : _e.RequestedTime.toLocaleString().split("GMT")[0]}</p>
                        </div>
                        <div class="footer">
                            <p>Thank you for your patience.</p>
                            <p>Best regards,<br>uniZ</p>
                        </div>
                    </div>
                </body>
                </html>
                `;
    return studentOutingEmailBody;
};
exports.getOutingMailFormatForStudent = getOutingMailFormatForStudent;
const getOutingMailFormatForWarden = (outing, user) => {
    var _a, _b, _c, _d;
    const wardenOutingEmailBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #4CAF50;
                font-size: 24px;
                margin-top: 0;
            }
            p {
                font-size: 16px;
                line-height: 1.6;
                margin: 10px 0;
            }
            .details {
                margin-top: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
            }
            .details p {
                margin: 5px 0;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>A New Outing Request from ${user.Username}</h1>
            <p><strong>Here are the details:</strong></p>
            <div class="details">
                <p><strong>Reason:</strong> ${(_a = outing.outing_details) === null || _a === void 0 ? void 0 : _a.reason}</p>
                <p><strong>From Time:</strong> ${(_b = outing.outing_details) === null || _b === void 0 ? void 0 : _b.FromTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                <p><strong>To Time:</strong> ${(_c = outing.outing_details) === null || _c === void 0 ? void 0 : _c.ToTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                <p><strong>Time Requested:</strong> ${(_d = outing.outing_details) === null || _d === void 0 ? void 0 : _d.RequestedTime.toLocaleString().split("GMT")[0]}</p>
            </div>
            <p>Go to the website now to approve or reject requests...</p>
            <div class="footer">
                <p>Thank you for your patience.</p>
                <p>Best regards,<br>uniZ</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return wardenOutingEmailBody;
};
exports.getOutingMailFormatForWarden = getOutingMailFormatForWarden;
exports.passwordResetSuccess = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .details {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Outpass Request</h1>
        <div class="details">
           <p>Your Password has been changed! We processed this on your request through uniZ website</p>
           <p><strong>If this is not you Complaint about this to warden!</strong></p>

           <p>**Kindly ignore this if it is done by you!</p>
        </div>
        <div class="footer">
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>uniZ</p>
        </div>
    </div>
</body>
</html>
`;
exports.passwordResetFailed = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .details {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Outpass Request</h1>
        <div class="details">
        <p>An attempt to change your password has been notices on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} through uniZ website</p>
        <p><strong>If this is not you Immediately Change your password or Complaint about this to warden!</strong></p>

        <p>**Kindly ignore this if it is done by you!</p>
        </div>
        <div class="footer">
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>uniZ</p>
        </div>
    </div>
</body>
</html>
`;
