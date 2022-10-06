const express=require("express")
const app=express()
app.use(express.json())
var { graphqlHTTP } = require('express-graphql');
var { buildSchema ,GraphQLObjectType} = require('graphql');
const { v4: v4 } = require('uuid');
const {insertStudents,insertStaff,insertSubjects,insertBooks,insertSingleStaff,insertSingleStudent} =require("./functions")
// console.log(v4())
const db=require("./conn");
const e = require("express");
const { response } = require("express");
const resolver=require("./resolvers")

app.get("/getAllBranches", async(req,res)=>{
    try {
        const branches=await db.CompanyModel.find({}, { _id: 0, __v: 0 })
       branches.forEach(ele=>{
        console.log(ele.branchName)
       })
       console.log("=============")
    } catch (error) {
        console.log(error)
        
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
        console.log(error)
        
    }
})

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
    try {
        const updateStudent=await db.StudentModel.updateOne({studentId:req.params.studentId},{
            studentName:req.body.studentName
        })
        console.log(updateStudent)
    } catch (error) {
        console.log(error)
    }
})

app.delete("/deleteStudentDetails/:studentId",async(req,res)=>{
    try {
        const deletedData=await db.BranchModel.updateOne({ "students.$[].studentId":req.params.studentId },{
            $pull:{
                students:{studentId:req.params.studentId}
            }
        })
        console.log(deletedData)
        const updateStudent=await db.StudentModel.deleteOne({studentId:req.params.studentId})
        console.log(updateStudent)
    } catch (error) {
        console.log(error)
    }
    
})

app.put("/updateBookDetails/:bookId",async(req,res)=>{
    try {
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
    } catch (error) {
        console.log(error)
    }

})

app.delete("/deleteBookDetails/:bookId",async(req,res)=>{
    try {
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
    } catch (error) {
        console.log(error)
    }
    
})

app.delete("/deleteSubject/:subjectId",async(req,res)=>{
   try {
   
     // console.log(req.params.subjectId)
     const getSubjectName=await db.SubjectModel.find({subjectId:req.params.subjectId},{_id:0})
     const {subjectName,branch}=JSON.parse(JSON.stringify(getSubjectName[0]))
     // console.log(subjectName)
 
     let getBookName=await db.BookModel.find({subjectName:subjectName},{bookName:1,_id:0})
     if(getBookName.length){
        getBookName=getBookName[0].bookName
        console.log(getBookName)
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
    
        // deleting from bookModel
    
        const deleteFromBookModel=await db.BookModel.deleteOne({subjectName:subjectName})
        console.log(deleteFromBookModel)
     }
 
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
        
        const getBookName=await db.BookModel.find({bookId:req.params.bookId},{bookName:1,subjectName:1,_id:0})
        const bookName=getBookName[0].bookName
        const subjectName=getBookName[0].subjectName

        let assignBook=await db.BranchModel.find({"books.$[].bookName":getBookName[0].bookName},{books:1,_id:0})
        assignBook=JSON.parse(JSON.stringify(assignBook[0]))
        var {books}=assignBook
        var foundBook=books.filter((ele)=>ele.bookName===bookName)
        // console.log(foundBook[0].takenBy==0)
        const ifSubjectAlreadyExists=await db.BooksPickedCountModel.find({subjectName:subjectName})
        console.log(typeof(foundBook[0].takenBy))
        if(foundBook[0].takenBy==="null" || foundBook[0].takenBy===null  ){
            if(ifSubjectAlreadyExists.length){
                const updateCount=await db.BooksPickedCountModel.updateOne({subjectName:subjectName},
                    { $inc: { count: 1 }}
                )
                    console.log(updateCount)
            }
            else{
                const addNewDoc=new db.BooksPickedCountModel({
                    subjectName:subjectName,
                    branchId:req.params.branchId,
                    count:1
                })
                const saveDoc=await addNewDoc.save()
                console.log(saveDoc)
            }
            const updateTakenBy=await db.BranchModel.updateOne({branchId:req.params.branchId},
                {$set:{
                    "books.$[b].takenBy":req.params.studentId
                }}
                ,{arrayFilters:[{"b.bookName":bookName}]})
            console.log(updateTakenBy)
            res.send("return it on time")
        }else{
            res.send("Book not available")
            
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
    try {
        
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
    } catch (error) {
        console.log(error)
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
        addStaffLogInTime
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
        const updateTime=await db.StudentTimeLogs.updateOne({studentId:req.params.studentId,branchId:req.params.branchId},{
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
        const updateTime=await db.StaffTimeLogs.updateOne({staffId:req.params.staffId,branchId:req.params.branchId},{
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

app.get("/majorityUsage",async (req,res)=>{
    try {
        
        const getUsageData=await db.BooksPickedCountModel.find({},{subjectName:1,count:1,_id:0})
        const mostReadSubject=getUsageData.reduce((a,b)=>{
            if(a.count>b.count){
                return a
            }else{
                return b
            }
        })
        res.send(`${mostReadSubject.subjectName} is the most read book over so far.`)
    } catch (error) {
        console.log(error)
    }
})
//..................

app.get("/getStatsOfPeoplePresent",async(req,res)=>{
    try {
        
        const {startTime,endTime}=req.body
        const getStudentStats=await db.StudentTimeLogs.find({inTime:{$gt:new Date(startTime)},outTime:{$lt:new Date(endTime)}})
        const getStaffStats=await db.StaffTimeLogs.find({inTime:{$gt:new Date(startTime)},outTime:{$lt:new Date(endTime)}})
        var students=[]
        var staffs=[]
        getStaffStats.forEach(async (ele)=>{
            const name=await db.StaffModel.find({staffId:ele.staffId},{staffName:1})
             staffs.push(name[0].staffName)
            
        })
        getStudentStats.forEach(async (ele)=>{
             const name=await db.StudentModel.find({studentId:ele.studentId},{studentName:1,})
            students.push(name[0].studentName)
        })
        
        setTimeout(()=>{
            console.log(staffs)
            res.send({"staffs":staffs,"students":students}
            )
        },2000)
    } catch (error) {
        console.log(error)
    }
})

app.get("/getBooksAvailableToReadInLibrary",async(req,res)=>{
    try {
        const getBooks=await db.BranchModel.find({"books.inLbrary":"true"})
        console.log("hello")
        console.log(getBooks)
    } catch (error) {
        console.log(error)
        
    }
})
//==============================================================================

//not required
// app.put("/updateStaff/:branchId/:staffId",async(req,res)=>{
//     try {
//         const staffId=req.params.staffId
//         const {name}=req.body
//         const branchId=req.params.branchId
       


//         //****code for nested array**** 
//         // const getData=await db.BranchModel.updateOne(
//         //     { branchName:branchName,"staffMembers.name":staffName},
//         //     { $set: { "staffMembers.$[a].area.$[b].areaName":name} },
//         //     { arrayFilters: [ {"a.name": staffName},{"b.pincode":"123456"}] }
//         //  )
      
//         const updatedData=await db.StaffModel.updateOne({branchId:branchId,staffId:staffId},
//                 {staffName:name}
//             )
//         console.log(updatedData)
        
        
//         if(updatedData?.modifiedCount){
//             // res.send(`${staffName} has been changed to ${name}`)
//             res.send("Changes have been made successfully")
//         }
//         else{
//             res.send("No staff was found with requested name")
//         }
        
//     } catch (error) {
//         console.log(error)
//     }
// })
// app.put("/updateSubject/:branchName/:field",async(req,res)=>{
//     try {

//         const subjectName=req.params.field
//         const {name}=req.body
       
//         const getData=await db.BranchModel.updateOne(
//             {branchName:req.params.branchName,"subjects.name":subjectName},{
//                 $set:{
//                     "subjects.$.name":name
//                 }
//             } )
        
//         console.log(getData.modifiedCount)
      
        
//         if(getData.modifiedCount){
//             res.send(`${subjectName} has been changed to ${name}`)
//         }
//         else{
//             res.send("No subject was found with requested name")
//         }


//     } catch (error) {
//         console.log(error)
//     }
// })

// app.put("/updateStudent/:branchName/:field",async(req,res)=>{
//     try {
       
//         const studentName=req.params.field
//         const branchName=req.params.branchName
//         const {name}=req.body
//         const updatedData=await db.BranchModel.updateOne({branchName:branchName,"students.name":studentName},{
//             $set:{
//                 "students.$.name":name
//             }
//         })
//         if(getData.modifiedCount){
//             res.send(`${studentName} has been changed to ${name}`)
//         }
//         else{
//             res.send("No student was found with requested name")
//         }

//     } catch (error) {
//         console.log(error)
//     }
// })
// app.put("/updateBook/:branchName/:field",async(req,res)=>{
//     try {
//         const bookName=req.params.field
//         const branchName=req.params.branchName
//         const {name}=req.body

//         const updatedData=await db.BranchModel.updateOne({branchName:branchName,"books.name":bookName},{
//             $set:{
//                 "books.$.name":name
//             }
//         })
//         if(updatedData?.modifiedCount){
//             res.send(`${bookName} has been changed to ${name}`)
           
//         }
//         else{
//             res.send(`No Book was found with given name in the branch ${branchName}`)
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })
// app.put("/updateBranch/:branchName",async(req,res)=>{
//     try {
//         const branchName=req.params.branchName
//         const {name}=req.body

//         const getData=await db.BranchModel.find({branchName:branchName},{_id:0,branchName:1}).update({branchName:name})
//         console.log(getData )
//         if(getData.modifiedCount){
//             res.send(`${branchName} has been changed to ${name}`)
           
//         }
//         else{
//             res.send(`No branch was found with name ${branchName}`)
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// app.delete("/deleteStaffMember/:branch/:staffName",async (req,res)=>{

//   try {
//     const {branchName,staffName}=req.params
//     const deletedData=await db.BranchModel.updateOne({},{ $pull: { staffMembers:{name:staffName} } })
//     console.log(deletedData)

//     if(deletedData?.modifiedCount){
//         res.send(`Staff with the name ${staffName} has been deleted successfully`)
//     }else{
//         res.send("Data is either not present or could not be deleted")
//     }

//   } catch (error) {
//     console.log(error)
//   }
// })

// app.delete("/deleteStudent/:branch/:studentName",async (req,res)=>{

//     const {branchName,studentName}=req.params
//     const deletedData=await db.BranchModel.updateOne({},{ $pull: { students:{name:studentName} } })
//     console.log(deletedData)
//     if(deletedData?.modifiedCount){
//         res.send(`Student with the name ${studentName} has been deleted successfully`)
//     }else{
//         res.send("Data is either not present or could not be deleted")
//     }

// })
// app.delete("/deleteBook/:branch/:bookName",async (req,res)=>{

//     const {branchName,bookName}=req.params
//     const deletedData=await db.BranchModel.updateOne({},{ $pull: { books:{name:bookName} } })
//     console.log(deletedData)
//     if(deletedData?.modifiedCount){
//         res.send(`Books with the name ${bookName} has been deleted successfully`)
//     }else{
//         res.send("Data is either not present or could not be deleted")
//     }

// })

// app.delete("/deleteSubject/:branch/:subjectName",async (req,res)=>{

//     const {branchName,subjectName}=req.params
//     const deletedData=await db.BranchModel.updateOne({},{ $pull: { subjects:{name:subjectName} } })
//     console.log(deletedData)
//     if(deletedData?.modifiedCount){
//         res.send(`Subject with the name ${subjectName} has been deleted successfully`)
//     }else{
//         res.send("Data is either not present or could not be deleted")
//     }

// })

// app.put("/insertNewStaff/:branchName",async (req,res)=>{
//     const branchName=req.params.branchName

//     const name=req.body.name
//    const updateData=await db.BranchModel.updateOne({branchName:"Mysore"},{$push:{
//     staffMembers:{
//         name:name 
//     }
//    }
// })
//     console.log(updateData)
// })



//graphql===============================================================================================


var schema=buildSchema(`

    # schema.gql
    scalar GraphQLDateTime
    scalar GraphQLObjectType

    type StaffmemberSchema{
        staffId:ID!,
        inTime:String,
        outTime:String
    }

    type StudentSchema{
        studentId:String
        inTime:GraphQLDateTime,
        outTime:GraphQLDateTime
    }
    type BookSchema{
        bookName:String,
        available:Boolean,
        takenBy:String,
        inLibrary:String,
    }
    type SubjectSchema{
        subjectName:String,
    }

    
    input Staffmemberinput{
        staffId:ID!,
        staffName:String
        inTime:String,
        outTime:String
    }

    input Studentinput{
        studentId:String
        studentName:String
        inTime:GraphQLDateTime,
        outTime:GraphQLDateTime
    }
    input Bookinput{
        bookName:String,
        available:Boolean,
        bookId:String
        takenBy:String,
        inLibrary:String,
        subjectName:String,
    }
    input Subjectinput{
        subjectName:String,
    }
    

    input BranchInput{
        companyName:String,
        branchName:String,
        branchId:String,
        staffMembers:[Staffmemberinput],
        students:[Studentinput],
        books:[Bookinput],
        subjects:[Subjectinput],
    }

    type BranchSchema{
        companyName:String,
        branchName:String,
        branchId:String,
        staffMembers:[StaffmemberSchema],
        students:[StudentSchema],
        books:[BookSchema],
        subjects:[SubjectSchema],
    }
    type BranchId{
        branchId:String
    }
    type Student{
        studentId:String,
        studentName:String,
        branch:[BranchId]
     }
     
     type Book{
         bookId:String,
         bookName:String,
         branch:[BranchId],
         subjectName:String
     }
     type Subject{
         subjectId:String,
         subjectName:String,
         branch:[BranchId]
     }
     
     type Staff{
         staffId:String,
         staffName:String,
         branchId:String
     }
     
     type BooksPickedCount {
         subjectName:String,
         branchId:String,
         count:Int
         }
     
     type Company{
         branchId:String,
         branchName:String,
         companyName:String,
         companyId:String  
     }
     
     type StudentTimeLogs{
         studentId:String,
         inTime:GraphQLDateTime,
         outTime:GraphQLDateTime,
         branchId:String
     }
     
     type StaffTimeLogs{
         staffId:String,
         inTime:GraphQLDateTime,
         outTime:GraphQLDateTime,
         branchId:String
     }
    input staffUpdateInput{
        staffId:String,
        staffName:String,
        branchId:String

    }
    input studentInput{
        studentId:String,
        studentName:String,
        branchId:String

    }

    input bookInput{
        bookId:String,
        bookName:String,
        oldName:String,
        subjectName:String
        branchId:String
    }
    input subjectInput{
        subjectId:String,
        subjectName:String
    }
    input branchInput{
        name:String,
        branchName:String
    }
    input assignBookInput{
        branchId:String,
        bookId:String,
        studentId:String

    }
    input timeInput{
        startTime:String,
        endTime:String
    }
    
    type Query{
        getAllBranchesDetails:[BranchSchema],
        getAllBranches:[Company],
        getAvailableBooks:[String],
        getStaffInOutTime:[StaffTimeLogs],
        getStudentInOutTime:[StudentTimeLogs],
        majorityUsage:String,
        getBooksAvailableToReadInLibrary:String
    }
    type Mutation{
        insertNewBranch(input:BranchInput):BranchSchema,
        updateStaffdetails(input:staffUpdateInput):Staff,
        deleteStaffdetails(input:staffUpdateInput):String,
        updateStudentdetails(input:studentInput):Student,
        deleteStudentDetails(input:studentInput): String,
        updateBookDetails(input:bookInput):String,
        deleteBookDetails(input:bookInput):String,
        deleteSubject(input:subjectInput):String,
        updateBranchName(input:branchInput):String,
        assignBookToStudent(input:assignBookInput):String,
        insertNewStaff(input:staffUpdateInput):String,
        insertNewStudent(input:studentInput):String,
        addNewSubject(input:subjectInput):String,
        addNewBook(input:bookInput):String,
        addNewBookToBranch(input:bookInput):String,
        addStudentLogInTime(input:studentInput):String,
        addStaffLogInTime(input:staffUpdateInput):String,
        updateStudentOutTime(input:studentInput):String,
        getStatsOfPeoplePresent(input:timeInput):String
    }

`)
var root={
    getAllBranchesDetails:resolver.getAllBranches,
    getAllBranches:resolver.getAllBranchesDetails,
    insertNewBranch:async({input})=>{
        
        try{
 
            input.branchId=v4()
            input.staffMembers.forEach((ele)=>{
                ele.staffId=v4()
            })
            input.students.forEach((ele)=>{
                ele.studentId=v4()
            })
          
          
            input.subjects.forEach((ele)=>{
                ele.subjectId=v4()
            })
            input.companyId=v4()
            const newBranch=new db.BranchModel(input)
            const addedNewCompany=await newBranch.save()
    
            const checkIfCompanyExists=await db.CompanyModel.find({companyName:input.companyName})
    
            if(checkIfCompanyExists.length){
                // console.log(checkIfCompanyExists[0].companyId)
                const company={
                    branchId:input.branchId,
                    branchName:input.branchName,
                    companyName:input.companyName,
                    companyId:checkIfCompanyExists[0].companyId
                }
                const newCompany=new db.CompanyModel(company)
                 this.insertedIntoCompany=await newCompany.save()
            }
            else{
                const company={
                    branchId:input.branchId,
                    branchName:input.branchName,
                    companyName:input.companyName,
                    companyId:input.companyId
                }
                const newCompany=new db.CompanyModel(company)
                 this.insertedIntoCompany=await newCompany.save()
            }
    
            if(this.insertedIntoCompany && addedNewCompany){
                insertStudents(input)
                insertStaff(input)
                insertSubjects(input)
                insertBooks(input)
                console.log("inserted successfully")
                return input
            }
            else{
                console.log("not inserted")
                 return input

            }
        }
        catch(err){
            console.log(err.message)
        }
    },
    updateStaffdetails:async({input})=>{
        console.log(input)
        try {
            const updateStaff=await db.StaffModel.updateOne({staffId:input.staffId},{
                staffName:input.staffName
            })
            console.log(updateStaff)
            const getUpdatedStaff=await db.StaffModel.find({staffId:input.staffId})
            console.log(getUpdatedStaff)
            return getUpdatedStaff[0]
        } catch (error) {
            console.log(error)
        }
    },
    deleteStaffdetails:async({input})=>{
        try {
            const deletedData=await db.BranchModel.updateOne({ "staffMembers.$[].staffId":input.staffId },{
                $pull:{
                    staffMembers:{staffId:input.staffId}
                }
            })
            console.log(deletedData)
            const updateStaff=await db.StaffModel.deleteOne({staffId:input.staffId},{
                staffName:input.staffName
            })
            console.log(updateStaff)
            if(deletedData.modifiedCount && updateStaff.deletedCount){
                return "Deleted Successfully"
            }
            else{
                return "Error Occured while deleting the Staff"
            }
            
        } catch (error) {
            console.log(error)
        }
    },
    updateStudentdetails:async({input})=>{
 
        try {
            const updateStudent=await db.StudentModel.updateOne({studentId:input.studentId},{
                studentName:input.studentName
            })
            console.log(updateStudent)
            const getUpdatedStudent=await db.StudentModel.find({studeId:input.studeId})
            return getUpdatedStudent[0]
        } catch (error) {
            console.log(error)
        }
    },
    deleteStudentDetails:async({input})=>{
        try {
            const deletedData=await db.BranchModel.updateOne({ "students.$[].studentId":input.studentId },{
                $pull:{
                    students:{studentId:input.studentId}
                }
            })
            console.log(deletedData)
            const updateStudent=await db.StudentModel.deleteOne({studentId:input.studentId})
            console.log(updateStudent)
            if(deletedData.modifiedCount && updateStudent.deletedCount){
                return "Deleted Successfully"
            }
            else{
                return "Error Occured while deleting the student"
            }
        } catch (error) {
            console.log(error)
        }
    },
    updateBookDetails:async({input})=>{
        try {
            const getBookName=await db.BookModel.find({bookId:input.bookId},{bookName:1,branch:1,_id:0})
        const branches=JSON.parse(JSON.stringify(getBookName[0]))
        const {branchId}=branches.branch[0]
        
    
        const updateBook=await db.BookModel.updateOne({bookId:input.bookId},{
            bookName:input.bookName
        })
        console.log(updateBook)
    
        const updateBookInBranch=await db.BranchModel.updateOne({branchId:branchId},{$set:{"books.$[b].bookName":input.bookName}},{arrayFilters:[{"b.bookName":input.oldName}]})
        console.log(updateBookInBranch)
        if(updateBook.modifiedCount && updateBookInBranch.modifiedCount ){
            console.log("updated successfully")
            return "updated successfully"

        }
        else{
            console.log("not updated")
            return "not updated"
        }
        } catch (error) {
            console.log(error)
        }
    
    },
    deleteBookDetails:async({input})=>{
        try {
            const getBookName=await db.BookModel.find({bookId:input.bookId},{bookName:1,branch:1,_id:0})
        const branches=JSON.parse(JSON.stringify(getBookName[0]))
        const {branchId}=branches.branch[0]
    
        const deletedData=await db.BranchModel.updateOne({branchId:branchId},{
            $pull:{
                books:{bookName:input.bookName}
            }
        })
        console.log(deletedData)
    
        const deletedBook=await db.BookModel.deleteOne({bookId:input.bookId})
        console.log(deletedBook)
        if(deletedData.modifiedCount && deletedBook.deletedCount){
            console.log("Deleted")
            return "Deleted"
        }else{
            console.log("not deleted")
            return "not deleted"
        }
        } catch (error) {
            console.log(error)
        }
    },
    deleteSubject:async({input})=>{
        try {
             // console.log(req.params.subjectId)
             const getSubjectName=await db.SubjectModel.find({subjectId:input.subjectId},{_id:0})
             const {subjectName,branch}=JSON.parse(JSON.stringify(getSubjectName[0]))
             // console.log(subjectName)
         
             let getBookName=await db.BookModel.find({subjectName:subjectName},{bookName:1,_id:0})
             if(getBookName.length){
                getBookName=getBookName[0].bookName
                console.log(getBookName)
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
            
                // deleting from bookModel
            
                const deleteFromBookModel=await db.BookModel.deleteOne({subjectName:subjectName})
                console.log(deleteFromBookModel)
             }
             
         
            //  deleting from subjectModel

             const deleteSubject=await db.SubjectModel.deleteOne({subjectId:input.subjectId})
             console.log(deleteSubject)

             if(deleteSubject.deletedCount){
                console.log("Deleted")
                return "Deleted"
             }else{
                console.log("not deleted")
                return "not deleted"
             }
        
           } catch (error) {
                console.log(error.message)
           }
    },
    updateBranchName:async({input})=>{
        try {
    
            const {name}=input
            const branchName=input.branchName
        
            const updatedData=await db.BranchModel.updateOne({branchName:branchName},{$set:{ branchName:name}})
            console.log(updatedData)
            if(updatedData.modifiedCount){
                console.log("Updated")
                return "Updated"
            }
            else{
                console.log("Not updated")
                return "Not updated"
            }
           } catch (error) {
            console.log(error.message)
           }
    },
    getAvailableBooks:async()=>{
        try {
            getAvailableBooks
            var booksAvailable=[]
            var getAvailableBooks=await db.BranchModel.find({},{books:1,_id:0})
            getAvailableBooks= JSON.parse(JSON.stringify(getAvailableBooks[0])).books
        // getAvailableBooks=getAvailableBooks.books
            getAvailableBooks=getAvailableBooks.filter((ele)=>ele.available===true)
            getAvailableBooks.forEach(ele=>{console.log(ele.bookName)
                booksAvailable.push(ele.bookName)
            })
            console.log(booksAvailable)
            return booksAvailable

        } catch (error) {
          console.log(error)
        }
    },
    assignBookToStudent:async({input})=>{
        try {
        
            const getBookName=await db.BookModel.find({bookId:input.bookId},{bookName:1,subjectName:1,_id:0})
            const bookName=getBookName[0].bookName
            const subjectName=getBookName[0].subjectName
    
            let assignBook=await db.BranchModel.find({"books.$[].bookName":getBookName[0].bookName,branchId:input.branchId},{books:1,_id:0})
            assignBook=JSON.parse(JSON.stringify(assignBook[0]))
            var {books}=assignBook
            console.log(assignBook)
            var foundBook=books.filter((ele)=>ele.bookName===bookName)

            // console.log(foundBook[0].takenBy==0)
            const ifSubjectAlreadyExists=await db.BooksPickedCountModel.find({subjectName:subjectName})
            console.log(foundBook[0].takenBy)
      
            if(foundBook[0].takenBy=="null" || foundBook[0].takenBy==null){
                if(ifSubjectAlreadyExists.length){
                    const updateCount=await db.BooksPickedCountModel.updateOne({subjectName:subjectName},
                        { $inc: { count: 1 }}
                    )
                        console.log(updateCount)
                }
                else{
                    const addNewDoc=new db.BooksPickedCountModel({
                        subjectName:subjectName,
                        branchId:input.branchId,
                        count:1
                    })
                    const saveDoc=await addNewDoc.save()
                    console.log(saveDoc)
                }
                const updateTakenBy=await db.BranchModel.updateOne({branchId:input.branchId},
                    {$set:{
                        "books.$[b].takenBy":input.studentId
                    }}
                    ,{arrayFilters:[{"b.bookName":bookName}]})
                console.log(updateTakenBy)
                console.log("return it on time")
                    return "return it on time"
              
            }else{
                    console.log("Book not available")
                    return "Book not available"
            }
            } catch (error) {
                console.log(error)
            }
    },
    insertNewStaff:async({input})=>{
        try {
            
            const {branchId,staffName}=input
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
        if(pushNewStaffInBranch.modifiedCount){
            insertSingleStaff(data)
            
            console.log("New staff added")
            return "New staff added"
        }
        else{
            console.log("Staff adding unsuccessfull")
            return "Staff adding unsuccessfull"
        }
        } catch (error) {
            console.log(error)
        }
    },
    insertNewStudent:async({input})=>{
        try {
            
            const {branchId,studentName}=input
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
        if(pushNewStudent.modifiedCount){
            insertSingleStudent(data)
            console.log("New student added")
            return "New student added"
        }
        else{
            console.log("Student adding unsuccessfull")
            return "Student adding unsuccessfull"
        }
        } catch (error) {
            console.log(error)
        }
    },
    addNewSubject:async({input})=>{
        try {
        
            const {subjectName}=input
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
                    console.log("subject has been added successfully")
                    return "subject has been added successfully"
                }
                else{
                    console.log("subject could not be added")
                    return "subject could not be added"
                }
            }
            
        } catch (error) {
            console.log(error)
        }
    },
    addNewBook:async({input})=>{
        try {
        
            const {bookName,subjectName}=input
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
                    console.log("Book has been added successfully")
                    return "Book has been added successfully"
                }else{
                    console.log("Book has not been added")
                    return "Book has not been added"
                }
            }
            else{
                console.log("no such subject exists")
                return "no such subject exists"
            }
    
        } catch (error) {
            console.log(error)
            
        }
    },
    addNewBookToBranch:async({input})=>{
        try {
        
            const branchId=input.branchId
            const {bookName}=input
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
                if(addBranchIdToBook.modifiedCount){
                   console.log("Book has been added successfully")
                   return "Book has been added successfully"
                }
                else{
                    console.log("Book addittion unsuccessfull")
                    return "Book addittion unsuccessfull"
                }
            }
            else{
                console.log("Book does not exists")
                return "Book does not exists"
            }
        } catch (error) {
            console.log(error)
        }
    },
    addStudentLogInTime:async({input})=>{
        try {
            const {studentId,branchId}=input
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
                console.log("Student has logged in")
                return "Student has logged in"
            }else{
                console.log("Student login failed")
                return "Student login failed"
            }
        } catch (error) {
            console.log(error)
        }
    },
    addStaffLogInTime:async({input})=>{
        try {
        
            const {staffId,branchId}=input
            const addStudentLogIn=new db.StaffTimeLogs({
                staffId:staffId,
                branchId:branchId,
                inTime:Date(Date.now()),
                outTime:null
            })
            const saveStaffLogin=await addStudentLogIn.save()
            console.log(saveStaffLogin)
            if(saveStaffLogin){
               console.log("Staff has logged in")
               return "Staff has logged in"
            }else{
                console.log("Staff login failed")
                return "Staff login failed"
            }
        } catch (error) {
            console.log(error)
        }
    },
    updateStudentOutTime:async({input})=>{
        try {
            const checkIfStudentIsPresent=await db.StudentTimeLogs.find({studentId:input.studentId,branchId:input.branchId})
            if(checkIfStudentIsPresent.inTime){
                 // console.log(req.params)
                const updateTime=await db.StudentTimeLogs.updateOne({studentId:input.studentId,branchId:input.branchId},{
                    outTime:Date(Date.now()),
                })
                console.log(updateTime)
                if(updateTime.modifiedCount){
                    console.log("Student has logged out")
                    return "Student has logged out"
                }
                else{
                console.log("Student logout unsuccessfull")
                return "Student logout unsuccessfull"
                }
            }else{
                console.log("Student not logged in")
                return "Student not logged in"
            }
           
        } catch ({error}) {
            console.log(error)   
        }
    },
    updateStaffOutTime:async({input})=>{
        try {
            const checkIfStaffIsPresent=await db.StudentTimeLogs.find({staffId:input.staffId,branchId:input.branchId})
            if(checkIfStaffIsPresent.inTime){
                // console.log(req.params)
            const updateTime=await db.StaffTimeLogs.updateOne({staffId:input.staffId,branchId:input.branchId},{
                outTime:Date(Date.now()),
            })
            console.log(updateTime)
            if(updateTime.modifiedCount){
                console.log("Staff has logged out")
                return "Staff has logged out"
            }
            else{
                console.log("Staff logout unsuccessfull")
                return "Staff logout unsuccessfull"
            }
            }
            else{
                console.log("Staff not present")
                return ("staff not present")
            }
            
        } catch ({error}) {
            console.log(error)   
        }
    },
    getStaffInOutTime:async({})=>{
        try {
            
            const getTimes=await db.StaffTimeLogs.find({})
    
            console.log(getTimes)
            getTimes.forEach(ele=>{
                console.log(ele.outTime?.toString())
                console.log(ele.inTime?.toString())
            })
            console.log(getTimes)
            return getTimes
        } catch (error) {
            console.log(error)
        }
        
    },
    getStudentInOutTime:async()=>{
        try {
        
            const getTimes=await db.StudentTimeLogs.find({})
    
            getTimes.forEach(ele=>{
                console.log(ele.outTime?.toString())
                console.log(ele.inTime?.toString())
            })
            console.log(getTimes)

            return getTimes
        } catch (error) {
            console.log(error)
        }
    },
    majorityUsage:async()=>{
        try {
            
            const getUsageData=await db.BooksPickedCountModel.find({},{subjectName:1,count:1,_id:0})
            const mostReadSubject=getUsageData.reduce((a,b)=>{
                if(a.count>b.count){
                    return a
                }else{
                    return b
                }
            })
            console.log(`${mostReadSubject.subjectName} is the most read book over so far.`)
            return `${mostReadSubject.subjectName} is the most read book over so far.`
        } catch (error) {
            console.log(error)
        }
    },
    getStatsOfPeoplePresent:async({input})=>{
        try {
        
            const {startTime,endTime}=input
            const getStudentStats=await db.StudentTimeLogs.find({inTime:{$gt:new Date(startTime)},outTime:{$lt:new Date(endTime)}})
            const getStaffStats=await db.StaffTimeLogs.find({inTime:{$gt:new Date(startTime)},outTime:{$lt:new Date(endTime)}})
            var students=[]
            var staffs=[]
            getStaffStats.forEach(async (ele)=>{
                const name=await db.StaffModel.find({staffId:ele.staffId},{staffName:1})
                 staffs.push(name[0].staffName)
                
            })
            getStudentStats.forEach(async (ele)=>{
                 const name=await db.StudentModel.find({studentId:ele.studentId},{studentName:1,})
                students.push(name[0].studentName)
            })
            
            setTimeout(()=>{
                console.log(staffs)
                console.log(students)
                return "Students and staffs"
            },2000)
        } catch (error) {
            console.log(error)
        }
    },
    getBooksAvailableToReadInLibrary:async()=>{
        try {
            const getBooks=await db.BranchModel.find({"books.inLbrary":"true"})
            console.log(JSON.stringify(getBooks[0].books))
            return "All books"
        } catch (error) {
            console.log(error)
            
        }
    }

}

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }));
app.listen(4000);
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');