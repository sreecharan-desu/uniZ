const getBaseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { background-color: #ffffff; width: 100%; max-width: 600px; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e9ecef; }
        .header { background-color: #1a1a1a; color: #ffffff; padding: 30px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
        .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.8; }
        .content { padding: 40px; }
        .title { color: #1a1a1a; font-size: 20px; font-weight: 600; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0; }
        .message { font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px; }
        .detail-card { background: #f8f9fa; border-radius: 6px; padding: 20px; border: 1px solid #e9ecef; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #666; font-size: 14px; }
        .detail-value { color: #1a1a1a; font-weight: 500; font-size: 14px; }
        .footer { background-color: #f1f3f5; padding: 20px 40px; text-align: center; font-size: 12px; color: #868e96; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>uniZ</h1>
            <p>Campus Management System</p>
        </div>
        <div class="content">
            <h2 class="title">${title}</h2>
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} uniZ. All rights reserved.</p>
            <p>This is an automated message. Please do not reply directly.</p>
        </div>
    </div>
</body>
</html>
`;

export const getOutpassMailFormatForStudent = (outpass: any) => {
    const details = outpass.outpass_details;
    const content = `
        <p class="message">Your outpass request has been successfully submitted and is pending approval.</p>
        <div class="detail-card">
            <div class="detail-row"><span class="detail-label">Request ID</span><span class="detail-value">#${details.id.slice(0, 8).toUpperCase()}</span></div>
            <div class="detail-row"><span class="detail-label">From Date</span><span class="detail-value">${new Date(details.FromDay).toLocaleDateString("en-IN")}</span></div>
            <div class="detail-row"><span class="detail-label">To Date</span><span class="detail-value">${new Date(details.ToDay).toLocaleDateString("en-IN")}</span></div>
            <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${details.Days} Days</span></div>
            <div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${details.Reason}</span></div>
        </div>
        <p style="margin-top: 25px; font-size: 14px; color: #666;">You will receive another notification once your request has been reviewed.</p>
    `;
    return getBaseTemplate("Outpass Request Received", content);
};

export const getOutpassMailFormatForAdministration = (outpass: any, user: any) => {
    const details = outpass.outpass_details;
    const content = `
        <p class="message">A new outpass request requires your attention.</p>
        <div class="detail-card">
            <div class="detail-row"><span class="detail-label">Student Name</span><span class="detail-value">${user.Username}</span></div>
            <div class="detail-row"><span class="detail-label">Request ID</span><span class="detail-value">#${details.id.slice(0, 8).toUpperCase()}</span></div>
            <div class="detail-row"><span class="detail-label">From Date</span><span class="detail-value">${new Date(details.FromDay).toLocaleDateString("en-IN")}</span></div>
            <div class="detail-row"><span class="detail-label">To Date</span><span class="detail-value">${new Date(details.ToDay).toLocaleDateString("en-IN")}</span></div>
            <div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${details.Reason}</span></div>
        </div>
        <div style="text-align: center;">
            <a href="https://sreesuniz.vercel.app/admin" class="btn">Review Request</a>
        </div>
    `;
    return getBaseTemplate("New Outpass Request", content);
};

export const getOutingMailFormatForStudent = (outing: any) => {
    const details = outing.outing_details;
    const date = new Date(details.FromTime).toLocaleDateString("en-IN");
    const fromTime = new Date(details.FromTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
    const toTime = new Date(details.ToTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });

    const content = `
        <p class="message">Your outing request has been successfully submitted for today.</p>
        <div class="detail-card">
            <div class="detail-row"><span class="detail-label">Request ID</span><span class="detail-value">#${details.id.slice(0, 8).toUpperCase()}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${date}</span></div>
            <div class="detail-row"><span class="detail-label">Time Window</span><span class="detail-value">${fromTime} - ${toTime}</span></div>
            <div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${details.reason}</span></div>
        </div>
        <p style="margin-top: 25px; font-size: 14px; color: #666;">You will receive another notification once your request has been reviewed.</p>
    `;
    return getBaseTemplate("Outing Request Received", content);
};

export const getOutingMailFormatForAdministration = (outing: any, user: any) => {
    const details = outing.outing_details;
    const date = new Date(details.FromTime).toLocaleDateString("en-IN");
    const fromTime = new Date(details.FromTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
    const toTime = new Date(details.ToTime).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });

    const content = `
        <p class="message">A new outing request requires your attention.</p>
        <div class="detail-card">
            <div class="detail-row"><span class="detail-label">Student Name</span><span class="detail-value">${user.Username}</span></div>
            <div class="detail-row"><span class="detail-label">Request ID</span><span class="detail-value">#${details.id.slice(0, 8).toUpperCase()}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${date}</span></div>
            <div class="detail-row"><span class="detail-label">Time Window</span><span class="detail-value">${fromTime} - ${toTime}</span></div>
            <div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${details.reason}</span></div>
        </div>
        <div style="text-align: center;">
            <a href="https://sreesuniz.vercel.app/admin" class="btn">Review Request</a>
        </div>
    `;
    return getBaseTemplate("New Outing Request", content);
};

export const getForwardedMailFormatForStudent = (requestType: string, id: string, fromRole: string, nextRole: string) => {
    const content = `
        <p class="message">Your ${requestType} request has been reviewed by the ${fromRole} and forwarded to the <strong>${nextRole}</strong> for further approval.</p>
        <div class="detail-card">
            <div class="detail-row"><span class="detail-label">Request ID</span><span class="detail-value">#${id.slice(0, 8).toUpperCase()}</span></div>
            <div class="detail-row"><span class="detail-label">Current Status</span><span class="detail-value" style="color: #2563eb; font-weight: bold;">Pending @ ${nextRole.toUpperCase()}</span></div>
        </div>
        <p style="margin-top: 25px; font-size: 14px; color: #666;">You will receive another notification once the ${nextRole} reviews your request.</p>
    `;
    return getBaseTemplate(`${requestType} Request Forwarded`, content);
};

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
           <p><strong>If this is not you Complaint about this to Administration!</strong></p>

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
        <p><strong>If this is not you Immediately Change your password or Complaint about this to Administration!</strong></p>

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