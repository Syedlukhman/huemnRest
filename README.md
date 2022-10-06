# huemnRest

rest input
{
"branchName":"bellary",
	"companyName":"BYJU's",
	
	"staffMembers":[{
		"staffId":"123",
		"staffName":"Staff1"
	},
								 {
		"staffId":"123",
		"staffName":"Staff2"
	}],
	"students":[
		{
			"studentName":"tingu"
		},
		{
			"studentName":"pingu"
		}
	],
	"books":[{
		"bookName":"Maths book","bookId":"123","subjectName":"Maths"
	},
					 {
		"bookName":"Physics book","bookId":"123","subjectName":"Physics"
					 	}
					],
	"subjects":[
		{
			"subjectName":"Maths"
		},
		{
		"subjectName":"Physics"
		}
	]
	
}

graphql data to insert:

mutation{
	insertNewBranch(input:{ branchName:"Bangalore", companyName:"BYJU's",

staffMembers:[{
	staffId:"123",
	staffName:"bangalore staff1"
},
							 {
	staffId:"123",
	staffName:"bangalore Staff2"
}],
students:[
	{
		studentName:"Bangalore student1"
	},
	{
		studentName:"Bangalore student2"
	}
],
books:[{
	bookName:"Maths book",bookId:"123",subjectName:"Maths"
},
				 {
	bookName:"Physics book",bookId:"123",subjectName:"Physics"
				 	}
				],
subjects:[
	{
		subjectName:"Maths"
	},
	{
	subjectName:"Physics"
	}
]
  }){
		branchName,
    companyName
  }
}
