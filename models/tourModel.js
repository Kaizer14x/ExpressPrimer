const mongoose = require('mongoose')
const slugify = require('slugify')
//An example of a schema
const TourSchema = new mongoose.Schema({
    name: {
        type: String,
        //The first index is for the option
        //and the second one is the error to be displayed
        required: [true, 'A tour must have a name'],
        unique: true,
        trim : true
        //there is maxlength , minlength, and for the numbers you can say : min, max
        //you can use 'enum' and an array as a value to choose from a set of choices
    },
    slug: String,  

    duration:{
        type: Number,
        required: [true,'A tour must have a duration']
        //you can also make you own validator by using something like : 
        //validate: function() {write here our function , and return the boolen value}
        //But there is a catch : the keyword this will oint to the current document only in the creation 
        //So it wont work whenmaking an update
        //there is a library of validator called validator
    },

    maxGroupSize:{
        type: Number,
        required:[true,'A tour must have a group size']
    },

    difficulty : {
        type:String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number, 
        default: 4.5},

    ratingQuantit: {
        type:Number,
        default: 0
    },
    price: {
        type : Number,
        required:[true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summery: {
        type:String,
        trim: true 
    },
    descreption : 
    {
        type : String,
        required: [true, 'A tour must have a descreption']
    },
    imageCover: {
        //This is a refrence to the real image
        type:String,
        required:[true, 'A tour must have an image']
    },
    images: [String],
    createdAt : {
        type : Date,
        default: Date.now(),
        select: false //to hide this field always and not display it to the user
    },
    startDates : [Date], 
    secretTour : {
        type:Boolean,
        default: false
    }
}, {
    //this second object is for the objects :
    toJSON: { virtuals : true},
    toObject: {virtuals : true}
})

//Virtual Proprety
TourSchema.virtual('duratInWeeks').get(function () {
    return this.duration / 7
    //we used a regular funcition, because the arrow functiondoes not have a this keyword
    //but the 'this' here is pointing to the actual document
} )



//The Docuent middleware/hook (after the saving or before it)
//This one is a pre the saving of the document :
//IMPORTANT NOTE : IT RUNES ONLY BEFORE THE : .save() an .create() , OT IN ANYTHING ELSE 
// TourSchema.pre('save' , function(next) {
//     //this keyword here is refernig to the current document
//     this.slug = slugify(this.name , {lower:true});
//     next()
// })

// //this excuting after thesaving of the document to the database @
// TourSchema.post('save' , function(doc,next) {
//     console.log(doc)
//     next()
// })

//The Queury middleware/hook (with the usage of 'find' , we will point to the current query instead of the current document)
TourSchema.pre('find' , function(next) {
    //Suppose that we want to make some tours justfor VIP members
    //this here refers to the query
    this.find({secretTour: {$ne: true}})
    next();
})


//it is a conventio to use the uppercase for the database models
const Tour = mongoose.model('Tour',TourSchema)


module.exports = Tour; 