const mongoose = require('mongoose')

const url = `mongodb+srv://syedlukhman:lukhman64@cluster0.khrukyr.mongodb.net/?retryWrites=true&w=majority`;


mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. ${err}`);
    })

const staffmemberSchema=new mongoose.Schema({
    staffId:{
        type:String,
        required:true
    },
    inTime:{
        type:String,
        default:"9:00 AM"
    },
    outTime:{
        type:String,
        default:"6:00 PM"
    }
})

const studentSchema=new mongoose.Schema({
    studentId:{
        type:String,
        required:true
    },
    inTime:Date,
    outTime:Date
})
const bookSchema=new mongoose.Schema({
    bookName:{
        type:String,
        required:true
    },
    available:{
        type:Boolean,
        default:true
    },
    
    takenBy:String //studentId

})
const subjectSchema=new mongoose.Schema({
    subjectName:{
        type:String,
        required:true
    }
})

const branchSchema=new mongoose.Schema({
    companyName:{
        type:String,
        required:true
    },
    branchName:{
        type:String,
        required:true
    },
    branchId:{
        type:String,
        required:true
    },
    staffMembers:{
        type:[staffmemberSchema],
        
    },
    students:{
        type:[studentSchema],
    },
    books:{
        type:[bookSchema],
    },
    subjects:{
        type:[subjectSchema],
    }
})

const student=new mongoose.Schema({
   studentId:{
    type:String,
    required:true
   },
   studentName:{
    type:String,
    required:true
   },
   branch:[{
    branchId:{
        type:String,
        required:true
    }
   }]
})

const book=new mongoose.Schema({
    bookId:{
        type:String,
        required:true
       },
    bookName:{
        type:String,
        required:true
    },
    branch:[{
        branchId:String
    }],
    subjectName:{
        type:String,
        required:true
    }

})
const subject=new mongoose.Schema({
    subjectId:{
        type:String,
        required:true
    },
    subjectName:{
        type:String,
        required:true
    },
    branch:[{
        branchId:String
    }]
    
})

const staff=new mongoose.Schema({
    staffId:{
        type:String,
        required:true
    },
    staffName:{
        type:String,
        required:true
    },
    branchId:{
        type:String,
        required:true
    }
})

const booksPickedCount= new mongoose.Schema({
    subjectId:{
        type:String,
        required:true
    },
    branchId:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        required:true,
        default:0
    }
})

const company=new mongoose.Schema({
    branchId:{
        type:String,
        required:true
    },
    branchName:{
        type:String,
        required:true
    },
    companyName:{
        type:String,
        required:true
    },
    companyId:{
        type:String,
        required:true
    }    

})

const BranchModel=new mongoose.model("branch",branchSchema)
const StudentModel= mongoose.model("student",student)
const BookModel= mongoose.model("book",book)
const StaffModel= mongoose.model("staff",staff)
const SubjectModel= mongoose.model("subject",subject)
const BooksPickedCountModel=mongoose.model("booksPickedCount",booksPickedCount)
const CompanyModel=mongoose.model("company",company)




module.exports={BranchModel,StudentModel,BookModel,StaffModel,SubjectModel,BooksPickedCountModel,CompanyModel}


