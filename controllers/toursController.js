// const fs = require('fs')
const Tour = require('../models/tourModel');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync')


class APIFeature {
    constructor(MongooseQuery , QueryString) {
        this.MongooseQuery = MongooseQuery;
        this.QueryString = QueryString;
    }

    filter() {
        // 1) Filtering
        //Getting a hardcopy from the objcet and not a refrence
        const queryObject = {...this.QueryString}
        //the fields that we will impplment after getting the results
        const excludedFields = ['page' , 'sort' , 'limit' , 'fields'];
        excludedFields.forEach(el => delete queryObject[el])      
       
        // 2) Advanced Filtering
        let querySTR = JSON.stringify(queryObject)
        querySTR = querySTR.replace(/\b(gte|gt|lte|lt)\b/g , match => `$${match}`)
        
        this.MongooseQuery = this.MongooseQuery.find(JSON.parse(querySTR))
        return this
    }

    sort() {
        //3) Sorting : 
        if(this.QueryString.sort) {
            const sortBy = this.QueryString.sort.split(',').join(' ')
            this.MongooseQuery = this.MongooseQuery.sort(sortBy)
        } else {
            this.MongooseQuery = this.MongooseQuery.sort('-createdAt')
        }
        return this
    }

    limitFields() {
        if(this.QueryString.fields) {
            const fields = this.QueryString.split(',').join(' ')
            this.MongooseQuery = this.MongooseQuery.select(fields)
        } else { 
            this.MongooseQuery = this.MongooseQuery.select('-__v')
        }
        return this
    }

    paginate() {
        //5) Pagination (distribute the results on pages, each containg a limit of results)
        const page = this.QueryString.page * 1 || 1 // to convert the string to a number
        const limit = this.QueryString.limit * 1 || 10
        const skip = (page - 1) * 10 //the formual to  good calculation
               
        this.MongooseQuery = this.MongooseQuery.skip(skip).limit(limit)
        return this
    }
}



exports.getAllTours = catchAsync(async (req,res,next) =>{
    const features = new APIFeature(Tour.find(),req.query)
        .filter() 
        .sort() 
        .limitFields()
        .paginate()
    const tours = await features.MongooseQuery;
    res.status(200).json({
    status: 'success',
    results: tours.length,
    data : {
        tours
    }
})
})

exports.getOneTour = catchAsync(async (req,res,next) =>{
    const tour = await Tour.findById(req.params.id) 

    if (!tour) 
    {
        next(new AppError('No tour found with that ID' , 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            results: tour.length,
            //The first tours, the one in the left
            //is the key in the following json  
            tour: tour
        }
    })
})

exports.updateTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id , req.body , {
        new : true, //the new updated document is the one that will be returned
        runValidators: true //To Research
    })

    if (!tour) 
    {
        next(new AppError('No tour found with that ID' , 404))
    }

    res.status(200).json({
        status: 'sucesss',
        data:  {
            tour: tour
        }
    })
})

exports.addOneTour = catchAsync(async (req,res,next) => {

    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            tour:newTour
        }
    })
})

exports.deleteTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if (!tour) 
    {
        next(new AppError('No tour found with that ID' , 404))
    }

    //In Rest APIs , we dont send data after a delete op
    res.status(204).json({
        status:'success',
        data: null
    })

})

exports.getTourStats = catchAsync(async (req,res,next) => {
    const stats = await Tour.aggregate([
        {
            $match:{ ratingsAverage : { $gte: 4.5 }}
        },
        {
            $group: 
            {
                _id: null,  //you can modify it to match a cretiera (for example the diffuclty)
                numTours: {$sum : 1},  //for each mdel we add 1                 averagePric: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats 
        }
    })
})