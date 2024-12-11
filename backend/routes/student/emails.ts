export const getOutpassMailFormatForStudent = (outpass:any)=>{
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
        <p>Your outpass request with ID: <strong>${
          outpass.outpass_details?.id
        }</strong> is being sent to your warden. You will be notified via email once it is approved or rejected.</p>
        <div class="details">
            <p><strong>From Day:</strong> ${
              outpass.outpass_details?.FromDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>To Day:</strong> ${
              outpass.outpass_details?.ToDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>No. of Days:</strong> ${
              outpass.outpass_details?.Days
            }</p>
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
}

export const getOutpassMailFormatForWarden = (outpass:any,user:any)=>{
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
            <p><strong>Reason:</strong> ${outpass.outpass_details?.Reason}</p>
            <p><strong>From Day:</strong> ${
              outpass.outpass_details?.FromDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>To Day:</strong> ${
              outpass.outpass_details?.ToDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>No. of Days:</strong> ${
              outpass.outpass_details?.Days
            }</p>
            <p>Go to the <a href="https://sreesuniz.vercel.app/">website</a> now to approve or reject requests...</p>
        </div>
        <div class="footer">
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>uniZ</p>
        </div>
    </div>
</body>
</html>
`;

return wardenOutPassEmailBody;
}

export const getOutingMailFormatForStudent = (outing)=>{
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
                        <p>Your outing request with ID: <strong>${
                        outing.outing_details?.id
                        }</strong> is being sent to your warden. You will be notified via email once it is approved or rejected.</p>
                        <div class="details">
                            <p><strong>Reason:</strong> ${outing.outing_details?.reason}</p>
                            <p><strong>From Time:</strong> ${
                            outing.outing_details?.FromTime.toLocaleString()
                                .split("05:30:00")[0]
                                .split(",")[1]
                            }</p>
                            <p><strong>To Time:</strong> ${
                            outing.outing_details?.ToTime.toLocaleString()
                                .split("05:30:00")[0]
                                .split(",")[1]
                            }</p>
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
}

export const getOutingMailFormatForWarden = (outing:any,user:any)=>{
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
                <p><strong>Reason:</strong> ${outing.outing_details?.reason}</p>
                <p><strong>From Time:</strong> ${outing.outing_details?.FromTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                <p><strong>To Time:</strong> ${outing.outing_details?.ToTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                <p>Go to the <a href="https://sreesuniz.vercel.app/">website</a> now to approve or reject requests...</p>
            </div>
            <div class="footer">
                <p>Thank you for your patience.</p>
                <p>Best regards,<br>uniZ</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return wardenOutingEmailBody;
}

export const passwordResetSuccess = `
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
        <h1>Your Password Reset Request</h1>
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

export const passwordResetFailed = `
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
        <h1>Your Password Reset Request</h1>
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