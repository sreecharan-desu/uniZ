import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const client = new PrismaClient();

export const isStudentPresentInCampus = async (id: string) => {
  const student = await client.student.findFirst({
    where: {
      id: id,
    },
    select: {
      isPresentInCampus: true,
    },
  });

  if (student != null) {
    return student.isPresentInCampus;
  } else {
    return {
      msg: "Invalid id",
      success: false,
    };
  }
};

export const isPendingApplication = async (id: string) => {
  const student = await client.student.findFirst({
    where: {
      id: id,
    },
    select: {
      isApplicationPending: true,
    },
  });
  if (student) {
    return {
      isPending: student.isApplicationPending,
      success: true,
    };
  } else {
    return {
      msg: "Invalid id",
      success: false,
    };
  }
};

// Fetch the current user by username
export const currentUserByUsername = async (username: string) => {
  try {
    const user = await client.student.findFirst({
      where: { Username: username },
      select: { id: true, Username: true, Password: true, Email: true },
    });
    if (user != null) {
      return { user, success: true };
    } else {
      console.log(`The user with username: ${username} doesn't exist`);
      return { success: false };
    }
  } catch (e) {
    console.log(`Error: The user with username: ${username} doesn't exist`);
    return { success: false };
  }
};

export const currentAdminByUsername = async (adminname: string) => {
  try {
    const admin = await client.admin.findFirst({
      where: { Username: adminname },
      select: { id: true, Username: true, Password: true },
    });
    if (admin != null) {
      return { admin, success: true };
    } else {
      console.log(`The admin with adminname: ${adminname} doesn't exist`);
      return { success: false };
    }
  } catch (e) {
    console.log(`Error: The admin with adminname: ${adminname} doesn't exist`);
    return { success: false };
  }
};

// Check if user exists by ID
export const findUserById = async (userId: string) => {
  try {
    const user = await client.student.findFirst({ where: { id: userId } });
    return user ? true : false;
  } catch (e) {
    console.log(e);
    console.log("Error finding user");
  }
};

// Check if user exists by username
export const findUserByUsername = async (username: string) => {
  try {
    const user = await client.student.findFirst({
      where: { Username: username },
    });
    return user ? true : false;
  } catch (e) {
    console.log("Error finding user");
  }
};

// Hash a password using bcrypt
export const hashPassword = async (password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 4);
    return { password: hashedPassword, success: true };
  } catch (e) {
    return { success: false };
  }
};

// Add a new student to the database
export const addStudent = async (username: string, password: string,gender : string,name:string) => {
  const hashedPassword = await hashPassword(password);
  const isUserPresent = await findUserByUsername(username);
  if (isUserPresent) {
    console.log("User already exists. Try a new username");
    return;
  }

  if (hashedPassword.success && hashedPassword.password && !isUserPresent) {
    try {
      const user = await client.student.create({
        data: {
          Username: username,
          Password: hashedPassword.password,
          Email: `${username}@rguktong.ac.in`,
          Gender : gender,
          Name : name
        },
        select: { id: true, Username: true },
      });
    } catch (e) {
      console.log(e);
      console.log("Error adding user");
    }
  } else {
    console.log("Error hashing password");
  }
};

// Fetch all users and their outpasses/outing details
export const getUsers = async () => {
  const users = await client.student.findMany({
    select: {
      id: true,
      Username: true,
      Email: true,
      isApplicationPending: true,
      isPresentInCampus: true,
      Outing: {
        select: {
          id: true,
          StudentId: true,
          reason: true,
          FromTime: true,
          ToTime: true,
          isExpired: true,
          RequestedTime: true,
          Hours: true,
          isApproved: true,
          isRejected: true,
          issuedBy: true,
          issuedTime: true,
          Message: true,
          rejectedBy: true,
          rejectedTime: true,
          inTime : true
        },
      },
      Outpass: {
        select: {
          id: true,
          StudentId: true,
          Reason: true,
          FromDay: true,
          ToDay: true,
          isExpired: true,
          RequestedTime: true,
          Days: true,
          isApproved: true,
          isRejected: true,
          issuedBy: true,
          issuedTime: true,
          Message: true,
          rejectedBy: true,
          rejectedTime: true,
          inTime : true
        },
      },
    },
  });

  const updatedUsersListAcctoLocaleTimeZone = await Promise.all(
    users.map(async (user) => {
      return {
        _id: user.id,
        username: user.Username,
        email: user.Email,
        has_pending_requests: user.isApplicationPending,
        is_in_campus: user.isPresentInCampus,
        outings_list: await Promise.all(
          user.Outing.map(async (outing) => {
            return {
              _id: outing.id,
              student_id: outing.StudentId,
              reason: outing.reason,
              from_time: new Date(outing.FromTime)
                .toLocaleString()
                .split(",")[1],
              to_time: new Date(outing.ToTime).toLocaleString().split(",")[1],
              no_of_hours: outing.Hours,
              requested_time: new Date(outing.RequestedTime).toLocaleString(),
              is_expired: outing.isExpired,
              is_approved: outing.isApproved,
              issued_by: outing.issuedBy,
              issued_time: new Date(outing.issuedTime).toLocaleString(),
              message: outing.Message,
              is_rejected: outing.isRejected,
              rejected_by: outing.rejectedBy,
              rejected_time: new Date(outing.rejectedTime).toLocaleString(),
              in_time: new Date(outing.inTime).toLocaleString().split(",")[1],
            };
          })
        ),
        outpasses_list: await Promise.all(
          user.Outpass.map(async (outpass) => {
            return {
              _id: outpass.id,
              student_id: outpass.StudentId,
              reason: outpass.Reason,
              from_day: outpass.FromDay.toLocaleDateString(),
              to_day: outpass.ToDay.toLocaleDateString(),
              no_of_days: outpass.Days,
              requested_time: outpass.RequestedTime.toLocaleTimeString(),
              is_expired: outpass.isExpired,
              is_approved: outpass.isApproved,
              issued_by: outpass.issuedBy,
              issued_time: outpass.issuedTime.toLocaleTimeString(),
              message: outpass.Message,
              is_rejected: outpass.isRejected,
              rejected_by: outpass.rejectedBy,
              rejected_time: outpass.rejectedTime.toLocaleTimeString(),
              in_time: outpass.inTime.toLocaleString(),
            };
          })
        ),
      };
    })
  );

  return updatedUsersListAcctoLocaleTimeZone;
};

// Request an outpass for a student
export const requestOutpass = async (
  reason: string,
  id: string,
  from_date: Date,
  to_date: Date
) => {
  if (
    from_date > to_date ||
    from_date < new Date() ||
    from_date == new Date()
  ) {
    if (from_date > to_date)
      return {
        msg: `Invalid input! You cannot request an outpass from ${
          from_date.toString().split("GMT")[0]
        } to ${to_date.toString().split("GMT")[0]}`,
        success: false,
      };
    else if (from_date <= new Date())
      return {
        msg: `Invalid input! You cannot request an outpass for a completed day (including Today : ${
          from_date.toString().split("GMT")[0].split("05:30:00")[0]
        } Since you are in campus) Enter tomorrow's date instead `,
        success: false,
      };
    return;
  } else {
    const user = await findUserById(id);
    if (user) {
      const outpass_id = "id_" + (await crypto.randomBytes(12).toString("hex"));
      try {
        const outpass = await client.outpass.create({
          data: {
            id: outpass_id,
            Reason: reason,
            FromDay: from_date,
            ToDay: to_date,
            StudentId: id,
            Days: to_date.getDate() - from_date.getDate(),
            isRejected: false,
            Message: "No message",
          },
          select: {
            id: true,
            Reason: true,
            FromDay: true,
            ToDay: true,
            Days: true,
            RequestedTime: true,
          },
        });
        await client.student.update({
          where: {
            id: id,
          },
          data: {
            isApplicationPending: true,
          },
        });
        return {
          outpass_details: outpass,
          msg: `OutpassRequest with id : ${outpass.id} sent Successfully You will notified via your  college-mail about its status!`,
          success: true,
        };
      } catch (e) {
        console.log(e)
        return {
          msg: "Error requesting an outpass, try again...",
          success: false,
        };
      }
    } else {
      return {
        msg: `The user with ID: ${id} doesn't exist`,
        success: false,
      };
    }
  }
};

// Get user details by ID
export const userDetailsById = async (id: string) => {
  const user = await client.student.findFirst({
    where: { id },
    select: {
      id: true,
      Username: true,
      Outpass: {
        select: {
          id: true,
          StudentId: true,
          isExpired: true,
          RequestedTime: true,
          FromDay: true,
          ToDay: true,
          Reason: true,
        },
      },
      Outing: {
        select: {
          id: true,
          StudentId: true,
          reason: true,
          FromTime: true,
          ToTime: true,
          isExpired: true,
          RequestedTime: true,
        },
      },
    },
  });
  console.log(user);
};

// Update expired outpasses
export const updatePasses = async () => {
  const currentUTCDate = new Date(); // Current UTC date and time

  // Fetch non-expired outpasses (date-based)
  const outpasses = await client.outpass.findMany({
    where: { isExpired: false },
    select: { id: true, ToDay: true }, // Assuming ToDay is a Date object
  });

  // Fetch non-expired outings (time-based)
  const outings = await client.outing.findMany({
    where: { isExpired: false },
    select: { id: true, ToTime: true }, // Assuming ToTime is stored as a Date
  });

  // Find expired outpasses based on the current UTC date
  const expiredOutpassIds = outpasses
    .filter((outpass) => outpass.ToDay < currentUTCDate) // Compare using UTC date
    .map((outpass) => outpass.id);

  // Since ToTime is already a Date object, directly compare it
  const expiredOutingsIds = outings
    .filter((outing) => {
      let isExpired = false;
      const currentDateString = new Date().toISOString().split("T")[0];
      const [h, m, s] = outing.ToTime.toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .split(":")
        .map((num) => parseInt(num));

      // Get current hours, minutes, and seconds
      const [c_hours, c_mins, c_secs] = [
        new Date().getHours(),
        new Date().getMinutes(),
        new Date().getSeconds(),
      ];

      // Time comparison logic
      if (
        c_hours > h ||
        (c_hours === h && (c_mins > m || (c_mins === m && c_secs > s)))
      ) {
        isExpired = true;
      }

      return isExpired; // Compare ToTime (Date) with current UTC date
    })
    .map((outing) => outing.id);

  // Update expired outings
  const expiredOutings = await Promise.all(
    expiredOutingsIds.map(async (outing_id) => {
      return await client.outing.update({
        where: { id: outing_id },
        data: { isExpired: true }, // Mark outing as expired
      });
    })
  );

  // Update expired outpasses
  const expiredPasses = await Promise.all(
    expiredOutpassIds.map(async (outpass_id) => {
      return await client.outpass.update({
        where: { id: outpass_id },
        data: { isExpired: true }, // Mark outpass as expired
      });
    })
  );

  // Logging the results
  if (expiredPasses.length) {
    console.log(
      `Outpasses with IDs: ${expiredPasses.map(
        (pass) => pass.id
      )} have expired at ${new Date().toLocaleTimeString()}`
    );
  } else {
    console.log(
      `No outpasses were expired at ${new Date().toLocaleTimeString()}`
    );
  }

  if (expiredOutings.length) {
    console.log(
      `Outings with IDs: ${expiredOutings.map(
        (pass) => pass.id
      )} have expired at ${new Date().toLocaleTimeString()}`
    );
  } else {
    console.log(
      `No outings were expired at ${new Date().toLocaleTimeString()}`
    );
  }
};

// Request an outing for a student
export const requestOuting = async (
  reason: string,
  id: string,
  from_time: string,
  to_time: string
) => {
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split("T")[0];
  const fromDateTime = new Date(`${currentDateString}T${from_time}`);
  const toDateTime = new Date(`${currentDateString}T${to_time}`);

  if (fromDateTime > toDateTime || fromDateTime < currentDate) {
    if (fromDateTime < currentDate) {
      return {
        msg: "You cannot take Outing from Completed Timeperiod",
        success: false,
      };
    } else {
      return {
        msg: `Invalid Time!!You cannot take outing from ${from_time} to ${to_time}`,
        success: false,
      };
    }
  }
  if (isNaN(fromDateTime.getTime()) || isNaN(toDateTime.getTime())) {
    return {
      msg: "Invalid date or time format.",
      success: false,
    };
  }
  const hoursDifference =
    (toDateTime.getTime() - fromDateTime.getTime()) / (1000 * 60 * 60);
  try {
    const outing_id = "id_" + (await crypto.randomBytes(12).toString("hex"));
    const outing = await client.outing.create({
      data: {
        id: outing_id,
        StudentId: id,
        reason,
        FromTime: fromDateTime,
        ToTime: toDateTime,
        Hours: Math.floor(hoursDifference),
      },
      select: {
        id: true,
        reason: true,
        FromTime: true,
        ToTime: true,
        RequestedTime: true,
      },
    });

    await client.student.update({
      where: {
        id: id,
      },
      data: {
        isApplicationPending: true,
      },
    });

    return {
      outing_details: outing,
      msg: `Outing request with id ${outing_id} sent successfully...`,
      success: true,
    };
  } catch (e) {
    return {
      msg: "Error processing request please try again!",
      success: false,
    };
  }
};

// Get an outpass by ID
export const getOutpassExistsbyID = async (id: string) => {
  try {
    const outpass = await client.outpass.findFirst({ where: { id } });
    return outpass ? true : false;
  } catch (e) {
    console.log("Error: Fetching outpasses");
    return false;
  }
};

export const getOutpassbyId = async (id: string) => {
  try {
    const outpass = await client.outpass.findFirst({ where: { id } });
    return outpass;
  } catch (e) {
    console.log("Error: Fetching outpasses");
    return false;
  }
};

// Fetch the current user by username
export const findAdminByUsername = async (username: string) => {
  try {
    const admin = await client.admin.findFirst({
      where: { Username: username },
      select: { id: true },
    });
    if (admin != null) {
      return { admin, success: true };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
};

// Add a new student to the database
export const addAdmin = async (username: string, password: string) => {
  const hashedPassword = await hashPassword(password);
  const id = "id_" + (await crypto.randomBytes(12).toString("hex"));
  const isUserPresent = (await findAdminByUsername(username)).success;
  if (isUserPresent) {
    console.log("Admin already exists. Try a new username");
    return;
  }

  if (hashedPassword.success && hashedPassword.password && !isUserPresent) {
    try {
      await client.admin.create({
        data: { id, Username: username, Password: hashedPassword.password },
        select: { id: true, Username: true },
      });
    } catch (e) {
      console.log("Error adding admin");
    }
  } else {
    console.log("Error hashing password");
  }
};

// Approve an outpass
export const approveOutpass = async (
  id: string,
  adminName: string = "admin",
  message?: string
) => {
  const outpassExists = await getOutpassExistsbyID(id);
  if (outpassExists) {
    const pass = await getOutpassbyId(id);
    if (pass && !pass.isApproved) {
      if (pass.isRejected) {
        return {
          msg: `You cannot approve a Rejected OutpassRequestThe outpass with id ${id} is already rejected on ${
            pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""
          } by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
          success: false,
        };
      } else {
        const outpass = await client.outpass.update({
          where: { id },
          data: {
            isApproved: true,
            issuedBy: "Warden",
            Message: "Approved by Warden ",
            issuedTime: new Date(),
            Student: {
              update: {
                isApplicationPending: false,
                isPresentInCampus: false,
              },
            },
          },
        });
        return {
          msg: `OutpassRequest with id : ${id} approved successfully...`,
          success: true,
        };
      }
    } else {
      return {
        msg: `The outpassRequest with id ${id} is already approved on ${
          pass ? pass.issuedTime : ""
        } by ${pass ? pass.issuedBy || pass.Message : ""}  `,
        success: false,
      };
    }
  } else {
    return {
      msg: `OutpassRequest with ID: ${id} doesn't exist!`,
      success: false,
    };
  }
};

export const rejectOutpass = async (
  id: string,
  adminName?: string,
  message?: string
) => {
  const outpassExists = await getOutpassExistsbyID(id);
  const pass = await getOutpassbyId(id);
  if (outpassExists) {
    if (pass && !pass.isRejected) {
      if (!pass.isApproved) {
        const outpass = await client.outpass.update({
          where: { id },
          data: {
            issuedTime: new Date(),
            isRejected: true,
            rejectedBy: `${adminName ? adminName : "Warden"}`,
            Message: `${
              message ? message : "Rejected by Warden for not valid reason"
            }`,
            rejectedTime: new Date(),
            Student: {
              update: {
                isApplicationPending: false,
              },
            },
          },
        });
        return {
          msg: `OutpassRequest with id ${id} rejected successfully...`,
          success: true,
        };
      } else {
        return {
          msg: `You cannot reject an approved OutpassRequest The outpass with id ${id} is already approved on ${
            pass ? pass.issuedTime.toString().split("GMT")[0] + "IST" : ""
          } by ${pass ? pass.issuedBy || pass.Message : ""}  `,
          success: false,
        };
      }
    } else {
      return {
        msg: `The OutpassRequest with id ${id} is already rejected on ${
          pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""
        } by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
        success: false,
      };
    }
  } else {
    return {
      msg: `OutpassRequest with ID: ${id} doesn't exist!`,
      success: false,
    };
  }
};

// Get an outpass by ID
export const getOutingExistsbyID = async (id: string) => {
  try {
    const outing = await client.outing.findFirst({ where: { id } });
    return outing ? true : false;
  } catch (e) {
    console.log("Error: Fetching outings");
    return false;
  }
};

export const getOutingbyId = async (id: string) => {
  try {
    const outing = await client.outing.findFirst({ where: { id } });
    return outing;
  } catch (e) {
    console.log("Error: Fetching outings");
    return false;
  }
};

// Approve an outpass
export const approveOuting = async (
  id: string,
  adminName: string = "admin",
  message?: string
) => {
  const outingExists = await getOutingExistsbyID(id);
  if (outingExists) {
    const pass = await getOutingbyId(id);
    if (pass && !pass.isApproved) {
      if (pass.isRejected) {
        return {
          msg: `You cannot approve a Rejected Outing RequestThe outpass with id ${id} is already rejected on ${
            pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""
          } by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
          success: false,
        };
      } else {
        await client.outing.update({
          where: { id },
          data: {
            isApproved: true,
            issuedBy: "Warden",
            Message: "Approved by Warden ",
            issuedTime: new Date(),
            Student: {
              update: {
                isApplicationPending: false,
                isPresentInCampus: false,
              },
            },
          },
        });
        return {
          msg: `OutingRequest with id : ${id} approved successfully...`,
          success: true,
        };
      }
    } else {
      return {
        msg: `The outingRequest with id ${id} is already approved on ${
          pass ? pass.issuedTime.toString().split("GMT")[0] + "IST" : ""
        } by ${pass ? pass.issuedBy || pass.Message : ""}  `,
        success: false,
      };
    }
  } else {
    return {
      msg: `OutingRequest with ID: ${id} doesn't exist!`,
      success: false,
    };
  }
};

export const rejectOuting = async (
  id: string,
  adminName?: string,
  message?: string
) => {
  const outingExists = await getOutingExistsbyID(id);
  const pass = await getOutingbyId(id);
  if (outingExists) {
    if (pass && !pass.isRejected) {
      if (!pass.isApproved) {
        await client.outing.update({
          where: { id },
          data: {
            issuedTime: new Date(),
            isRejected: true,
            rejectedBy: `${adminName ? adminName : "Warden"}`,
            Message: `${
              message ? message : "Rejected by Warden for not valid reason"
            }`,
            rejectedTime: new Date(),
            Student: {
              update: {
                isApplicationPending: false,
              },
            },
          },
        });
        return {
          msg: `OutingRequest with id ${id} rejected successfully...`,
          success: true,
        };
      } else {
        return {
          msg: `You cannot reject an approved OutingRequest The outingRequest with id ${id} is already approved on ${
            pass ? pass.issuedTime.toString().split("GMT")[0] + "IST" : ""
          } by ${pass ? pass.issuedBy || pass.Message : ""}  `,
          success: false,
        };
      }
    } else {
      return {
        msg: `The outingRequest with id ${id} is already rejected on ${
          pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""
        } by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
        success: false,
      };
    }
  } else {
    return {
      msg: `OutingRequest with ID: ${id} doesn't exist!`,
      success: false,
    };
  }
};

//Function that runs every 1 minute to update the Expired Passes

export const updateDB = () => {
  updatePasses();
  setInterval(() => {
    updatePasses();
  }, 5 * 1000);
};

export const sendEmail = async (
  email: string,
  subject: string,
  body: string,
  // context : "sendoutpass" | "sendouting" | "approveouting" | "approveoutpass" | "rejectoutpass" | "rejectouting"
) => {

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'noreply.uniz@gmail.com',
      pass: 'xihr obwi mcpy rspg',
    },
  });

  var mailOptions = {
    from: 'noreply.uniz@gmail.com',
    to: email,
    subject: subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      info,
      success: true,
    };
  } catch (error) {
    return {
      info: "Error sending email !!",
      success: true,
    };
  }
};

export const updateStudentPassword = async (
  username: string,
  password: string
) => {
  const hash = await hashPassword(password);
  if (hash && hash.success) {
    await client.student.update({
      where: {
        Username: username,
      },
      data: {
        Password: hash.password,
      },
    });
    return true;
  } else {
    return false;
  }
};

export const updateAdminPassword = async (
  username: string,
  password: string
) => {
  const hash = await hashPassword(password);
  if (hash && hash.success) {
    await client.admin.update({
      where: {
        Username: username,
      },
      data: {
        Password: hash.password,
      },
    });
    return true;
  } else {
    return false;
  }
};

export const getOutPassRequests = async () => {
  const requests = await client.outpass.findMany({
    where: {
      isApproved: false,
      isRejected: false,
      isExpired: false,
    },
    select: {
      id: true,
      StudentId: true,
      Reason: true,
      FromDay: true,
      ToDay: true,
      Days: true,
      RequestedTime: true,
      isExpired: true,
      isApproved: true,
      Student : true
    },
  });
  const updatedRequests = await Promise.all(
    requests.map(async (outpass) => {
      return {
        _id: outpass.id,
        student_id: outpass.StudentId,
        reason: outpass.Reason,
        from_day: outpass.FromDay.toLocaleDateString(),
        to_day: outpass.ToDay.toLocaleDateString(),
        no_of_days: outpass.Days,
        requested_time: outpass.RequestedTime.toLocaleString().split("GMT")[0],
        is_expired: outpass.isExpired,
        is_approved: outpass.isApproved,
        username : outpass.Student.Username,
        email : outpass.Student.Email
      };
    })
  );

  return updatedRequests;
};

export const getOutingRequests = async () => {
  const requests = await client.outing.findMany({
    where: {
      isApproved: false,
      isRejected: false,
      isExpired: false,
    },
    select: {
      id: true,
      StudentId: true,
      reason: true,
      FromTime: true,
      ToTime: true,
      RequestedTime: true,
      isExpired: true,
      isApproved: true,
      Student : true
    },
  });
  const updatedRequests = await Promise.all(
    requests.map(async (outing) => {
      return {
        _id: outing.id,
        student_id: outing.StudentId,
        reason: outing.reason,
        from_time: outing.FromTime.toLocaleTimeString(),
        to_time: outing.ToTime.toLocaleTimeString(),
        requested_time: outing.RequestedTime.toLocaleString().split("GMT")[0],
        is_expired: outing.isExpired,
        is_approved: outing.isApproved,
        username : outing.Student.Username,
        email : outing.Student.Email
      };
    })
  );

  return updatedRequests;
};

export const getStudentsOutsideCampus = async () => {
  const users = await client.student.findMany({
    where: {
      isPresentInCampus: false,
    },
    select: {
      id: true,
      Username: true,
      Email: true,
      Name : true,
      Gender : true,
      isApplicationPending: true,
      isPresentInCampus: true,
      Outing: {
        select: {
          id: true,
          StudentId: true,
          reason: true,
          FromTime: true,
          ToTime: true,
          isExpired: true,
          RequestedTime: true,
          Hours: true,
          isApproved: true,
          isRejected: true,
          issuedBy: true,
          issuedTime: true,
          Message: true,
          rejectedBy: true,
          rejectedTime: true,
          inTime : true
        },
      },
      Outpass: {
        select: {
          id: true,
          StudentId: true,
          Reason: true,
          FromDay: true,
          ToDay: true,
          isExpired: true,
          RequestedTime: true,
          Days: true,
          isApproved: true,
          isRejected: true,
          issuedBy: true,
          issuedTime: true,
          Message: true,
          rejectedBy: true,
          rejectedTime: true,
          inTime : true
        },
      },
    },
  });

  const updatedUsersListAcctoLocaleTimeZone = await Promise.all(
    users.map(async (user) => {
      return {
        _id: user.id,
        username: user.Username,
        email: user.Email,
        has_pending_requests: user.isApplicationPending,
        is_in_campus: user.isPresentInCampus,
        outings_list: await Promise.all(
          user.Outing.map(async (outing) => {
            return {
              _id: outing.id,
              student_id: outing.StudentId,
              reason: outing.reason,
              from_time: new Date(outing.FromTime)
                .toLocaleString()
                .split(",")[1],
              to_time: new Date(outing.ToTime).toLocaleString().split(",")[1],
              no_of_hours: outing.Hours,
              requested_time: new Date(outing.RequestedTime).toLocaleString(),
              is_expired: outing.isExpired,
              is_approved: outing.isApproved,
              issued_by: outing.issuedBy,
              issued_time: new Date(outing.issuedTime).toLocaleString(),
              message: outing.Message,
              is_rejected: outing.isRejected,
              rejected_by: outing.rejectedBy,
              rejected_time: new Date(outing.rejectedTime).toLocaleString(),
              in_time: new Date(outing.inTime).toLocaleString().split(",")[1],
            };
          })
        ),
        outpasses_list: await Promise.all(
          user.Outpass.map(async (outpass) => {
            return {
              _id: outpass.id,
              student_id: outpass.StudentId,
              reason: outpass.Reason,
              from_day: outpass.FromDay.toLocaleDateString(),
              to_day: outpass.ToDay.toLocaleDateString(),
              no_of_days: outpass.Days,
              requested_time: outpass.RequestedTime.toLocaleTimeString(),
              is_expired: outpass.isExpired,
              is_approved: outpass.isApproved,
              issued_by: outpass.issuedBy,
              issued_time: outpass.issuedTime.toLocaleTimeString(),
              message: outpass.Message,
              is_rejected: outpass.isRejected,
              rejected_by: outpass.rejectedBy,
              rejected_time: outpass.rejectedTime.toLocaleTimeString(),
              in_time: outpass.inTime,
            };
          })
        ),
      };
    })
  );

  return updatedUsersListAcctoLocaleTimeZone;
};


export const updateUserPrescence = async (userId: string,id:string) => {
  try {
      const student = await client.student.update({
        where: {
          id: userId,
        },
        data: {
          isPresentInCampus: true,
        },
      });
      
    try{
      await client.outing.update({
        where: {
          id : id
        },data : {
          inTime : new Date(),
          isExpired : true
        }
      })
    }catch(e){
      await client.outpass.update({
        where: {
          id : id
        },data : {
          inTime : new Date(),
          isExpired : true
        }
      })
    }
    return {
      msg: `Successfully updated student prescence with ID Number : ${student.Username}`,
      success: true,
    };
    
  } catch (e) {
    console.log(e);
    return {
      msg: `Error updating student prescence Try again!`,
      success: false,
    };
  }

}

export const getStudentDetails = async (username:string) => {
  const user = await client.student.findFirst({
    where : {
      Username : username.toLowerCase()
    },
    select: {
      id: true,
      Username: true,
      Email: true,
      isApplicationPending: true,
      isPresentInCampus: true,
      Name : true,
      Gender : true,
      Outing: {
        select: {
          id: true,
          StudentId: true,
          reason: true,
          FromTime: true,
          ToTime: true,
          isExpired: true,
          RequestedTime: true,
          Hours: true,
          isApproved: true,
          isRejected: true,
          issuedBy: true,
          issuedTime: true,
          Message: true,
          rejectedBy: true,
          rejectedTime: true,
          inTime : true
        },
      },
      Outpass: {
        select: {
          id: true,
          StudentId: true,
          Reason: true,
          FromDay: true,
          ToDay: true,
          isExpired: true,
          RequestedTime: true,
          Days: true,
          isApproved: true,
          isRejected: true,
          issuedBy: true,
          issuedTime: true,
          Message: true,
          rejectedBy: true,
          rejectedTime: true,
          inTime : true,
        },
      },
    },
  });

  if(user){
    const updatedUserListAcctoLocaleTimeZone =  {
          _id: user.id,
          username: user.Username,
          name : user.Name,
          gender : user.Gender,
          email: user.Email,
          has_pending_requests: user.isApplicationPending,
          is_in_campus: user.isPresentInCampus,
          outings_list: await Promise.all(
          user.Outing.map(async (outing) => {
              return {
                _id: outing.id,
                student_id: outing.StudentId,
                reason: outing.reason,
                from_time: new Date(outing.FromTime)
                  .toLocaleString()
                  .split(",")[1],
                to_time: new Date(outing.ToTime).toLocaleString().split(",")[1],
                no_of_hours: outing.Hours,
                requested_time: new Date(outing.RequestedTime).toLocaleString(),
                is_expired: outing.isExpired,
                is_approved: outing.isApproved,
                issued_by: outing.issuedBy,
                issued_time: new Date(outing.issuedTime).toLocaleString(),
                message: outing.Message,
                is_rejected: outing.isRejected,
                rejected_by: outing.rejectedBy,
                rejected_time: new Date(outing.rejectedTime).toLocaleString(),
                in_time: new Date(outing.inTime).toLocaleString().split(",")[1],
              };
            })
          ),
          outpasses_list: await Promise.all(
            user.Outpass.map(async (outpass) => {
              return {
                _id: outpass.id,
                student_id: outpass.StudentId,
                reason: outpass.Reason,
                from_day: outpass.FromDay.toLocaleDateString(),
                to_day: outpass.ToDay.toLocaleDateString(),
                no_of_days: outpass.Days,
                requested_time: outpass.RequestedTime.toLocaleTimeString(),
                is_expired: outpass.isExpired,
                is_approved: outpass.isApproved,
                issued_by: outpass.issuedBy,
                issued_time: outpass.issuedTime.toLocaleTimeString(),
                message: outpass.Message,
                is_rejected: outpass.isRejected,
                rejected_by: outpass.rejectedBy,
                rejected_time: outpass.rejectedTime.toLocaleTimeString(),
                in_time: outpass.inTime.toLocaleString(),
              };
            })
          ),
        };
    return updatedUserListAcctoLocaleTimeZone;
  }else{
    return null;
  }
  
};