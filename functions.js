const db=require("./conn")

function insertStudents(data){
    const {branchId,students}=data
    students.forEach(async(student)=>{
        const studentData={
            studentId:student.studentId,
            studentName:student.studentName,
            branch:[{branchId:branchId}]
        }
        const insertStudentDetails=new db.StudentModel(studentData)
        const addedNewStudent=await insertStudentDetails.save()
      
    })
}

function insertStaff(data){
    const {branchId,staffMembers}=data
    // console.log("consoling staffs",staffMembers)
    staffMembers.forEach(async(staffMember)=>{
        const staffData={
            staffId:staffMember.staffId,
            staffName:staffMember.staffName,
            branchId:branchId
        }
        const insertStudentDetails=new db.StaffModel(staffData)
        const addedNewStaff=await insertStudentDetails.save()
    })
}

function insertSubjects(data){
    const {branchId,subjects}=data
    // console.log("consoling staffs",subjects)
    subjects.forEach(async(subject)=>{
        const subjects=await db.SubjectModel.find({subjectName:subject.subjectName},{subjectName:1,_id:0})
        // console.log(subjects[0].subjectName)
       const addNewBranchId=await db.SubjectModel.updateOne({subjectName:subjects[0].subjectName},
        {$push:{
            branch:{
                branchId:branchId
            }
        }})
 
    })
}
function insertBooks(data){
    const {branchId,books}=data
    // console.log("consoling staffs",subjects)
    books.forEach(async(book)=>{
        console.log("books",book.subjectName)
        const subjectName=await db.SubjectModel.find({subjectName:book.subjectName},{subjectName:1,_id:0})
        // console.log(subjectName)
       const addNewBranchId=await db.BookModel.updateOne({subjectName:subjectName[0].subjectName},
        {$push:{
            branch:{
                branchId:branchId
            }
        }})
        console.log(addNewBranchId)
  
 
    })
}

module.exports={insertStudents,insertStaff,insertSubjects,insertBooks}