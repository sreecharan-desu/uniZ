import express from "express";
import { studentRouter } from "./student/student";
import { adminRouter } from "./admin/admin";
import { addAdmin, updateDB } from "./helper-functions";
// import xlsx from "xlsx"

updateDB();

export const mainRoute = express.Router();

console.log("Admins updated successfully")
mainRoute.use("/student",studentRouter);
mainRoute.use("/admin",adminRouter);


// interface Student {
//     IDNO: string;
//     Email: string;
//     Password: string;
//     NAME: string;
//     GENDER: string;
// }

// const addStudents = async()=>{
//     try {
//         console.log("Adding data please hold on...");
//         const filePath = "./data.xlsx";
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         let records = 0;
//         const students: Student[] = xlsx.utils.sheet_to_json<Student>(sheet);
//         for (const student of students) {
//           await addStudent(student.IDNO.toLowerCase(),student.Password.toLowerCase(),student.GENDER,student.NAME);
//           records++;
//           if(records%100){
//             console.log(`Completed ${records} records until ${new Date().toLocaleString()}`)
//           }
//         }
//         console.log(`Successfully added ${records} students from the Excel file`);

//       } catch (error) {
//         console.error("Error adding students:", error);

//       }
// }
