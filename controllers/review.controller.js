import reviewModel from "../models/reviewSchema.js"


const createReview = async(req, res) => {
    try {
        const response = await reviewModel.create(req.body)
        res.status(201).json({
            data:response , 
            message: "Review is created"
        })
    } catch (error) {
        res.status(400).json({message :error.message})
        
    }
}

const getAllReviews = async(req , res) => {
    try {
        const response = await reviewModel.find()
        res.status(200).json({
            data:response,
            message: "All review  are fetched"
        })
    } catch (error) {
        res.status(400).json({message : error.message})
    }
}

const getReviewById = async(req, res )=> {
    try {
        const response = await reviewModel.findById(req.params.id)
        res.status(200).json({
            data:response,
            message:"Review is fetched"
        })
    } catch (error) {
        res.status.json({
            message:error.message
        })
        
    }
}

const updateReview = async(req , res)=> {
    try {
      const response = await reviewModel.findByIdAndUpdate(req.params.id ,req.body, {new:true})
      res.status(200).json({
          data : response,
          message : "Review is updated"
      })
      
    } catch (error) {
      res.status(400).json({message : error.message})
    }
  }
  

const deleteReivew = async(req, res) => {
   try {
    await reviewModel.findByIdAndDelete(req.params.id)
    res.status(200).json({
        message:"Review deleted"
    })
   } catch (error) {
    res.status(400).json({message : error.message})
    
   }
}

export default {
   createReview,
   getReviewById,
   deleteReivew,
    getAllReviews,
    updateReview
}