const express=require("express")
const app=express()
app.use(express.json())
const { v4: v4 } = require('uuid');
const {insertStudents,insertStaff,insertSubjects,insertBooks,insertSingleStaff,insertSingleStudent} =require("./functions")
// console.log(v4())
const db=require("./conn");
const e = require("express");
const { response } = require("express");

app.get("/getAllBranches", async(req,res)=>{
    try {
        const branches=await db.CompanyModel.find({}, { _id: 0, __v: 0 })
       branches.forEach(ele=>{
        console.log(ele.branchName)
       })
       console.log("=============")
    } catch (error) {
        
    }
})
app.get("/getAllBranchesDetails", async(req,res)=>{
    try {
        const branches=await db.BranchModel.find({}, { _id: 0, __v: 0 })
       branches.forEach(ele=>{
        console.log(ele.branchName)
       })
       console.log("=============")
    } catch (error) {
        
    }
})
async function getBookIdFromDb(data){
    // console.log("bookNAme",data.bookName)
    

    return getBookId

}
app.post("/insertNewBranch",async(req,res)=>{
    try{
 
        req.body.branchId=v4()
        req.body.staffMembers.forEach((ele)=>{
            ele.staffId=v4()
        })
        req.body.students.forEach((ele)=>{
            ele.studentId=v4()
        })
      
      
        req.body.subjects.forEach((ele)=>{
            ele.subjectId=v4()
        })
        req.body.companyId=v4()
        const newBranch=new db.BranchModel(req.body)
        const addedNewCompany=await newBranch.save()

        const checkIfCompanyExists=await db.CompanyModel.find({companyName:req.body.companyName})

        if(checkIfCompanyExists.length){
            // console.log(checkIfCompanyExists[0].companyId)
            const company={
                branchId:req.body.branchId,
                branchName:req.body.branchName,
                companyName:req.body.companyName,
                companyId:checkIfCompanyExists[0].companyId
            }
            const newCompany=new db.CompanyModel(company)
             this.insertedIntoCompany=await newCompany.save()
        }
        else{
            const company={
                branchId:req.body.branchId,
                branchName:req.body.branchName,
                companyName:req.body.companyName,
                companyId:req.body.companyId
            }
            const newCompany=new db.CompanyModel(company)
             this.insertedIntoCompany=await newCompany.save()
        }

        if(this.insertedIntoCompany && addedNewCompany){
            insertStudents(req.body)
            insertStaff(req.body)
            insertSubjects(req.body)
            insertBooks(req.body)
            res.send("inserted successfully")
        }
        else{
            res.send("not inserted")
        }
    }
    catch(err){
        console.log(err.message)
    }
})

app.put("/updateStaffdetails/:staffId",async(req,res)=>{
    const updateStaff=await db.StaffModel.updateOne({staffId:req.params.staffId},{
        staffName:req.body.staffName
    })
    console.log(updateStaff)
})

app.delete("/deleteStaffdetails/:staffId",async(req,res)=>{
    const deletedData=await db.BranchModel.updateOne({ "staffMembers.$[].staffId":req.params.staffId },{
        $pull:{
            staffMembers:{staffId:req.params.staffId}
        }
    })
    console.log(deletedData)
    const updateStaff=await db.StaffModel.deleteOne({staffId:req.params.staffId},{
        staffName:req.body.staffName
    })
    console.log(updateStaff)
    
})
app.put("/updateStudentdetails/:studentId",async(req,res)=>{
    const updateStudent=await db.StudentModel.updateOne({studentId:req.params.studentId},{
        studentName:req.body.studentName
    })
    console.log(updateStudent)
})

app.delete("/deleteStudentDetails/:studentId",async(req,res)=>{
    const deletedData=await db.BranchModel.updateOne({ "students.$[].studentId":req.params.studentId },{
        $pull:{
            students:{studentId:req.params.studentId}
        }
    })
    console.log(deletedData)
    const updateStudent=await db.StudentModel.deleteOne({studentId:req.params.studentId})
    console.log(updateStudent)
    
})
app.put("/updateBookDetails/:bookId",async(req,res)=>{
    const getBookName=await db.BookModel.find({bookId:req.params.bookId},{bookName:1,branch:1,_id:0})
    const branches=JSON.parse(JSON.stringify(getBookName[0]))
    const {branchId}=branches.branch[0]
    

    const updateBook=await db.BookModel.updateOne({bookId:req.params.bookId},{
        bookName:req.body.bookName
    })
    console.log(updateBook)

    const updateBookInBranch=await db.BranchModel.updateOne({branchId:branchId},{$set:{"books.$[b].bookName":req.body.bookName}},{arrayFilters:[{"b.bookName":req.body.oldName}]})
    console.log(updateBookInBranch)
    if(updateBook.modifiedCount && updateBookInBranch.modifiedCount ){
        res.send("updated successfully")
    }
    else{
        res.send("not updated")
    }

})

app.delete("/deleteBookDetails/:bookId",async(req,res)=>{
    const getBookName=await db.BookModel.find({bookId:req.params.bookId},{bookName:1,branch:1,_id:0})
    const branches=JSON.parse(JSON.stringify(getBookName[0]))
    const {branchId}=branches.branch[0]

    const deletedData=await db.BranchModel.updateOne({branchId:branchId},{
        $pull:{
            books:{bookName:req.body.bookName}
        }
    })
    console.log(deletedData)

    const deletedBook=await db.BookModel.deleteOne({bookId:req.params.bookId})
    console.log(deletedBook)
    if(deletedData.modifiedCount && deletedBook.deletedCount){
        res.send("Deleted")
    }else{
        res.send("not deleted")
    }
    
})

app.delete("/deleteSubject/:subjectId",async(req,res)=>{
   try {
    
     // console.log(req.params.subjectId)
     const getSubjectName=await db.SubjectModel.find({subjectId:req.params.subjectId},{_id:0})
     const {subjectName,branch}=JSON.parse(JSON.stringify(getSubjectName[0]))
     // console.log(subjectName)
 
     let getBookName=await db.BookModel.find({subjectName:subjectName},{bookName:1,_id:0})
     getBookName=getBookName[0].bookName
     //deleting book with subject name
     branch.forEach(async (ele)=>{
         console.log(ele)
         const deletedData=await db.BranchModel.updateOne({branchId:ele.branchId},{
             $pull:{
                 books:{bookName:getBookName}
             }
         })
         console.log(deletedData)
     })
 
 
 
    //  deleting from branch's subjects
     branch.forEach(async (ele)=>{
         console.log(ele.branchId)
         const deleteSubjectFromBranch=await db.BranchModel.updateOne({subjectName:subjectName},{$pull:{subjects:{subjectName:subjectName}}})
         console.log(deleteSubjectFromBranch)
 
     })
 
    //  deleting from bookModel
 
     const deleteFromBookModel=await db.BookModel.deleteOne({subjectName:subjectName})
     console.log(deleteFromBookModel)
 
    //  deleting from subjectModel
     const deleteSubject=await db.SubjectModel.deleteOne({subjectId:req.params.subjectId})
     console.log(deleteSubject)

   } catch (error) {
        console.log(error.message)
   }

})

app.put("/updateBranchName/:branchName",async(req,res)=>{
   try {
    const {name}=req.body
    const branchName=req.params.branchName

    const updatedData=await db.BranchModel.updateOne({branchName:branchName},{$set:{ branchName:name}})
    console.log(updatedData)
    res.send("updated branch name")
   } catch (error) {
    console.log(error.message)
   }
})

//to show available books ready from all branches

app.get("/getAvailableBooks",async (req,res)=>{
    try {
        var booksAvailable=[]
        var getAvailableBooks=await db.BranchModel.find({},{books:1,_id:0})
        getAvailableBooks= JSON.parse(JSON.stringify(getAvailableBooks[0])).books
    // getAvailableBooks=getAvailableBooks.books
        getAvailableBooks=getAvailableBooks.filter((ele)=>ele.available===true)
        getAvailableBooks.forEach(ele=>{console.log(ele.bookName)
            booksAvailable.push(ele.bookName)
        })
    } catch (error) {
        var getAvailableBooks=await db.BranchModel.find({},{books:1,_id:0})
        getAvailableBooks= JSON.parse(JSON.stringify(getAvailableBooks[0])).books
    // getAvailableBooks=getAvailableBooks.books
        getAvailableBooks=getAvailableBooks.filter((ele)=>ele.available===true)
        getAvailableBooks.forEach(ele=>console.log(ele.bookName))
    }
})

//continue from here
 
app.put('/assignBookToStudent/:bookId/:studentId/:branchId',async (req,res)=>{
     try {
        const getBookName=await db.BookModel.find({bookId:req.params.bookId},{bookName:1,_id:0})
     const bookName=getBookName[0].bookName
     let assignBook=await db.BranchModel.find({"books.$[].bookName":getBookName[0].bookName},{books:1,_id:0})
    assignBook=JSON.parse(JSON.stringify(assignBook[0]))
    var {books}=assignBook

    // books.map((ele)=>{
    //     console.log(ele.bookName==getBookName[0].bookName)  
    // })
    // const book=
   
    var foundBook=books.filter((ele)=>ele.bookName===bookName)
    console.log(foundBook[0].takenBy==0)
    if(foundBook[0].takenBy!==null){
        res.send("Book not available")
    }else{
        const updateTakenBy=await db.BranchModel.updateOne({branchId:req.params.branchId},
            {$set:{
                "books.$[b].takenBy":req.params.studentId
            }}
            ,{arrayFilters:[{"b.bookName":bookName}]})
        console.log(updateTakenBy)
        res.send("return it on time")
    }
     } catch (error) {
        console.log(error)
     }
    })

app.post("/insertNewStaff",async (req,res)=>{
    try {
        const {branchId,staffName}=req.body
        const staffId=v4()
    const pushNewStaffInBranch=await db.BranchModel.updateOne({branchId:branchId},{$push:{
        staffMembers:{
            staffId:staffId,
            inTime:"9:00 AM",
            outTime:"6:00 PM"
        }
    }})
    console.log(pushNewStaffInBranch)
    const data={
        branchId:branchId,
        staffId:staffId,
        staffName:staffName
    }
    insertSingleStaff(data)
    if(pushNewStaffInBranch.modifiedCount){
        res.send("New staff added")
    }
    else{
        res.send("Staff adding unsuccessfull")
    }
    } catch (error) {
        console.log(error)
    }
})

app.post("/insertNewStudent",async(req,res)=>{
    try {
        const {branchId,studentName}=req.body
        const studentId=v4()
        const pushNewStudent=await db.BranchModel.updateOne({branchId:branchId},{$push:{
        students:{
            studentId:studentId
          
        }
    }})
    console.log(pushNewStudent)
    const data={
        branch:[{branchId:branchId}],
        studentId:studentId,
        studentName:studentName
    }
    insertSingleStudent(data)
    if(pushNewStudent.modifiedCount){
        res.send("New student added")
    }
    else{
        res.send("Student adding unsuccessfull")
    }
    } catch (error) {
        console.log(error)
    }
})

app.post("/addNewSubject",async(req,res)=>{
    try {
        const {subjectName}=req.body
        const checkIfsubjectExists=await db.SubjectModel.find({subjectName:subjectName})
        console.log(checkIfsubjectExists.length)
        if(checkIfsubjectExists.length){
            res.send(`subject with name ${subjectName} already exists`)
        }
        else{
            const subjectData={
                subjectName:subjectName,
                subjectId:v4(),
                branch:[]
            }
            const insertNewSubject=new db.SubjectModel(subjectData)
            const addedNewSubject=await insertNewSubject.save()
            console.log(addedNewSubject)
            if(addedNewSubject){
                res.send("subject has been added successfully")
            }
            else{
                res.send("subject could not be added")
            }
        }
        
    } catch (error) {
        console.log(error)
    }
    
})

app.post("/addNewBook",async(req,res)=>{
    try {
        const {bookName,subjectName}=req.body
        const checkIfSubjectExists=await db.SubjectModel.find({subjectName:subjectName},{_id:0})
        console.log(checkIfSubjectExists.length)
        if(checkIfSubjectExists.length){
            const addNewBook=new db.BookModel({
                bookId:v4(),
                bookName:bookName,
                subjectName:subjectName,
                branch:[]
            })
            const saveNewBook=await addNewBook.save()
            console.log(saveNewBook)
            if(saveNewBook){
                res.send("Book has been added successfully")
            }else{
                res.send("Book has not been added")
            }
        }
        else{
            res.send("no such subject exists")
        }

    } catch (error) {
        
    }
})

app.put("/addNewBookToBranch/:branchId",async (req,res)=>{
    const branchId=req.params.branchId
    const {bookName}=req.body
    const checkIfBookExist=await db.BookModel.find({bookName:bookName})
    if(checkIfBookExist.length){
        const addNewBook=await db.BranchModel.updateOne({branchId:branchId},{$push:{
            books:{
                bookName:bookName,
                available:true,
                takenBy:null
            }
        }})
        const addBranchIdToBook=await db.BookModel.updateOne({bookName:bookName},{$push:{
            branch:{
                branchId:branchId
            }
        }})
        console.log(addBranchIdToBook)
        if(true){
            res.send("Book has been added successfully")
        }
        else{
            res.send("Book addittion unsuccessfull")
        }
    }
    else{
        res.send("Book does not exists")
    }
})

app.post("/addStudentLogInTime/:studentId/:branchId",async(req,res)=>{
    try {
        const {studentId,branchId}=req.params
        let date=Date(Date.now())
        const addStudentLogIn=new db.StudentTimeLogs({
            studentId:studentId,
            branchId:branchId,
            inTime:Date(Date.now()),
            outTime:null
        })
        const saveStudentLogin=await addStudentLogIn.save()
        console.log(saveStudentLogin)
        if(saveStudentLogin){
            res.send("Student has logged in")
        }else{
            res.send("Student login failed")
        }
    } catch (error) {
        console.log(error)
    }
})

app.post("/addStaffLogInTime/:staffId/:branchId",async(req,res)=>{
    try {
        const {staffId,branchId}=req.params
        const addStudentLogIn=new db.StaffTimeLogs({
            staffId:staffId,
            branchId:branchId,
            inTime:Date(Date.now()),
            outTime:null
        })
        const saveStaffLogin=await addStudentLogIn.save()
        console.log(saveStaffLogin)
        if(saveStaffLogin){
            res.send("Staff has logged in")
        }else{
            res.send("Staff login failed")
        }
    } catch (error) {
        console.log(error)
    }
})

app.put("/updateStudentOutTime/:studentId",async (req,res)=>{
    try {
        // console.log(req.params)
        const updateTime=await db.StudentTimeLogs.updateOne({studentId:req.params.studentId},{
            outTime:Date(Date.now()),
        })
        console.log(updateTime)
        if(updateTime.modifiedCount){
            res.send("Student has logged out")
        }
        else{
            res.send("Student logout unsuccessfull")
        }
    } catch ({error}) {
        console.log(error)   
    }
})

app.put("/updateStaffOutTime/:staffId",async (req,res)=>{
    try {
        // console.log(req.params)
        const updateTime=await db.StaffTimeLogs.updateOne({staffId:req.params.staffId},{
            outTime:Date(Date.now()),
        })
        console.log(updateTime)
        if(updateTime.modifiedCount){
            res.send("Staff has logged out")
        }
        else{
            res.send("Staff logout unsuccessfull")
        }
    } catch ({error}) {
        console.log(error)   
    }
})

app.get("/getStaffInOutTime",async (req,res)=>{
    try {
        const getTimes=await db.StaffTimeLogs.find({})

        console.log(getTimes)
        getTimes.forEach(ele=>{
            console.log(ele.outTime.toString())
            console.log(ele.inTime.toString())
        })
        res.send(getTimes)
    } catch (error) {
        console.log(error)
    }
})

app.get("/getStudentInOutTime",async (req,res)=>{
    try {
        const getTimes=await db.StudentTimeLogs.find({})

        console.log(getTimes)
        getTimes.forEach(ele=>{
            console.log(ele.outTime.toString())
            console.log(ele.inTime.toString())
        })
        res.send(getTimes)
    } catch (error) {
        console.log(error)
    }
})
//==============================================================================
app.put("/updateStaff/:branchId/:staffId",async(req,res)=>{
    try {
        const staffId=req.params.staffId
        const {name}=req.body
        const branchId=req.params.branchId
       


        //****code for nested array**** 
        // const getData=await db.BranchModel.updateOne(
        //     { branchName:branchName,"staffMembers.name":staffName},
        //     { $set: { "staffMembers.$[a].area.$[b].areaName":name} },
        //     { arrayFilters: [ {"a.name": staffName},{"b.pincode":"123456"}] }
        //  )
      
        const updatedData=await db.StaffModel.updateOne({branchId:branchId,staffId:staffId},
                {staffName:name}
            )
        console.log(updatedData)
        
        
        if(updatedData?.modifiedCount){
            // res.send(`${staffName} has been changed to ${name}`)
            res.send("Changes have been made successfully")
        }
        else{
            res.send("No staff was found with requested name")
        }
        
    } catch (error) {
        console.log(error)
    }
})
app.put("/updateSubject/:branchName/:field",async(req,res)=>{
    try {

        const subjectName=req.params.field
        const {name}=req.body
       
        const getData=await db.BranchModel.updateOne(
            {branchName:req.params.branchName,"subjects.name":subjectName},{
                $set:{
                    "subjects.$.name":name
                }
            } )
        
        console.log(getData.modifiedCount)
      
        
        if(getData.modifiedCount){
            res.send(`${subjectName} has been changed to ${name}`)
        }
        else{
            res.send("No subject was found with requested name")
        }


    } catch (error) {
        console.log(error)
    }
})

app.put("/updateStudent/:branchName/:field",async(req,res)=>{
    try {
       
        const studentName=req.params.field
        const branchName=req.params.branchName
        const {name}=req.body
        const updatedData=await db.BranchModel.updateOne({branchName:branchName,"students.name":studentName},{
            $set:{
                "students.$.name":name
            }
        })
        if(getData.modifiedCount){
            res.send(`${studentName} has been changed to ${name}`)
        }
        else{
            res.send("No student was found with requested name")
        }

    } catch (error) {
        console.log(error)
    }
})
app.put("/updateBook/:branchName/:field",async(req,res)=>{
    try {
        const bookName=req.params.field
        const branchName=req.params.branchName
        const {name}=req.body

        const updatedData=await db.BranchModel.updateOne({branchName:branchName,"books.name":bookName},{
            $set:{
                "books.$.name":name
            }
        })
        if(updatedData?.modifiedCount){
            res.send(`${bookName} has been changed to ${name}`)
           
        }
        else{
            res.send(`No Book was found with given name in the branch ${branchName}`)
        }
    } catch (error) {
        console.log(error)
    }
})
app.put("/updateBranch/:branchName",async(req,res)=>{
    try {
        const branchName=req.params.branchName
        const {name}=req.body

        const getData=await db.BranchModel.find({branchName:branchName},{_id:0,branchName:1}).update({branchName:name})
        console.log(getData )
        if(getData.modifiedCount){
            res.send(`${branchName} has been changed to ${name}`)
           
        }
        else{
            res.send(`No branch was found with name ${branchName}`)
        }
    } catch (error) {
        console.log(error)
    }
})

app.delete("/deleteStaffMember/:branch/:staffName",async (req,res)=>{

  try {
    const {branchName,staffName}=req.params
    const deletedData=await db.BranchModel.updateOne({},{ $pull: { staffMembers:{name:staffName} } })
    console.log(deletedData)

    if(deletedData?.modifiedCount){
        res.send(`Staff with the name ${staffName} has been deleted successfully`)
    }else{
        res.send("Data is either not present or could not be deleted")
    }

  } catch (error) {
    console.log(error)
  }
})

app.delete("/deleteStudent/:branch/:studentName",async (req,res)=>{

    const {branchName,studentName}=req.params
    const deletedData=await db.BranchModel.updateOne({},{ $pull: { students:{name:studentName} } })
    console.log(deletedData)
    if(deletedData?.modifiedCount){
        res.send(`Student with the name ${studentName} has been deleted successfully`)
    }else{
        res.send("Data is either not present or could not be deleted")
    }

})
app.delete("/deleteBook/:branch/:bookName",async (req,res)=>{

    const {branchName,bookName}=req.params
    const deletedData=await db.BranchModel.updateOne({},{ $pull: { books:{name:bookName} } })
    console.log(deletedData)
    if(deletedData?.modifiedCount){
        res.send(`Books with the name ${bookName} has been deleted successfully`)
    }else{
        res.send("Data is either not present or could not be deleted")
    }

})

app.delete("/deleteSubject/:branch/:subjectName",async (req,res)=>{

    const {branchName,subjectName}=req.params
    const deletedData=await db.BranchModel.updateOne({},{ $pull: { subjects:{name:subjectName} } })
    console.log(deletedData)
    if(deletedData?.modifiedCount){
        res.send(`Subject with the name ${subjectName} has been deleted successfully`)
    }else{
        res.send("Data is either not present or could not be deleted")
    }

})

app.put("/insertNewStaff/:branchName",async (req,res)=>{
    const branchName=req.params.branchName

    const name=req.body.name
   const updateData=await db.BranchModel.updateOne({branchName:"Mysore"},{$push:{
    staffMembers:{
        name:name 
    }
   }
})
    console.log(updateData)
})

app.listen(5501,()=>{
    console.log("listening on port 3000")
})