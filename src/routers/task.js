const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

//1. Posting

router.post('/tasks',auth ,async (req, res) =>{
    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        // console.log(task)
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
    
    
})

//2. Retrieving info

//GET /tasks?status=true   or false
//GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt:asc //or desc
router.get('/tasks', auth,async (req, res)=>{
    const match = {}
    const sort = {}
    if(req.query.status) {
        match.status = req.query.status
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        // const tasks = await Task.findOne({ owner: req.user._id })   // Line below does the same thing as this line
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }


            // match: {
            //     status: false
            // }
        }).execPopulate()
        // console.log(req.user.tasks)
        res.send(req.user.tasks)
        
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id',auth ,async (req, res) =>{
    const _id = req.params.id
    console.log(req.params.id)
    try {
        // const s_task = await Task.findById(tId)
        console.log("tiD: ", _id)
        console.log(req.user._id)
        const s_task = await Task.findOne({_id, owner: req.user._id})
        console.log(s_task)
        if(!s_task){
            return res.status(404).send("No such task devised yet")
        } else {
            res.status(200).send(s_task)
        }
    } catch (e) {
        console.log("error :", e)
        res.status(500).send(e)
    }
    
})

//For updating resources

router.patch('/tasks/:id',auth , async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','description','status']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'})
    }

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        console.log(task)
        if(!task){
            return res.status(404).send("Can't find task by ID")
        }
        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

//For Deleting resources



router.delete('/tasks/:id',auth ,async (req, res)=>{
    try {
        console.log(req.params.id)
        console.log(req.user._id)
        const task = await Task.findOneAndDelete({_id: req.params.id,owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router