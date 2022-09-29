const express=require("express")
const app=express()
app.use(express.json())
const { v4: v4 } = require('uuid');
const {insertStudents,insertStaff,insertSubjects,insertBooks} =require("./functions")
console.log(v4())

const db=require("./conn")

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

app.post("/insertNewBranch",async(req,res)=>{
    try{
 
        req.body.branchId=v4()
        req.body.staffMembers.forEach((ele)=>{
            ele.staffId=v4()
        })
        req.body.students.forEach((ele)=>{
            ele.studentId=v4()
        })
      
        req.body.books.forEach((ele)=>{
            ele.bookId=v4()
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
//continue from here
app.put("/updateBookDetails/:bookId",async(req,res)=>{
    const updateStudent=await db.StudentModel.updateOne({studentId:req.params.studentId},{
        studentName:req.body.studentName
    })
    console.log(updateStudent)
})

app.delete("/deleteBookDetails/:bookId",async(req,res)=>{
    const deletedData=await db.BranchModel.updateOne({ "books.$[].studentId":req.params.studentId },{
        $pull:{
            students:{studentId:req.params.studentId}
        }
    })
    console.log(deletedData)
    const updateStudent=await db.StudentModel.deleteOne({studentId:req.params.studentId})
    console.log(updateStudent)
    
})

app.put("/updateBranchName/:branchName",async(req,res)=>{
   try {
    const {name}=req.body
    const branchName=req.params.branchName

    const updatedData=await db.BranchModel.updateOne({branchName:branchName},{$set:{ branchName:name}})
    console.log(updatedData)
    res.send("done")
   } catch (error) {
    console.log(error.message)
   }
})

app.put("/updateStaff/:branchName/:field",async(req,res)=>{
    try {
        const staffName=req.params.field
        const {name}=req.body
        const branchName=req.params.branchName


        //****code for nested array**** 
        // const getData=await db.BranchModel.updateOne(
        //     { branchName:branchName,"staffMembers.name":staffName},
        //     { $set: { "staffMembers.$[a].area.$[b].areaName":name} },
        //     { arrayFilters: [ {"a.name": staffName},{"b.pincode":"123456"}] }
        //  )
      
        const updatedData=await db.BranchModel.updateOne({branchName:branchName,"staffMemebers.name":staffName},
                {$set:{
                    "staffMembers.$.name":name
                }}
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

app.listen(3000,()=>{
    console.log("listening on port 3000")
})