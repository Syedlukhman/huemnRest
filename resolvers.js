const db=require("./conn")

async function getAllBranchesDetails(){
    
        try {
            let branch=[]
            const branches=await db.CompanyModel.find({}, { _id: 0, __v: 0 })
           branches.forEach(ele=>{
            console.log(ele.branchName)
            branch.push(ele)
           })
           console.log("=============")
           return branch
        } catch (error) {
            console.log(error)
            
        }
    
}
async function getAllBranches(){
    try {
        let branch=[]
        const branches=await db.BranchModel.find({}, { _id: 0, __v: 0 })
       branches.forEach(ele=>{
        console.log(ele)
        branch.push(ele)
       })
       
       console.log("=============")
       return(branch)
    } catch (error) {
        console.log(error)
    }
}

module.exports={
    getAllBranchesDetails,
    getAllBranches
}