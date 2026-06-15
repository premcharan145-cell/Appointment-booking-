import Tasks from "../models/tasks.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as vectorService from '../services/vectorService.js';

dotenv.config();

const SECRETE_KEY = process.env.SECRETE_KEY;

export async function createTask(data, token){
    let response;
    try
    {
        const payload = jwt.verify(token, SECRETE_KEY); //Authorization
        data.createdby = payload.crid;
        
        data.vector = await vectorService.generateVector(data.title + " " + data.description);
        
        await Tasks.create(data); //Insert into MongoDB
        response = {code: 200, message: "New task has been created"};
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function getAllTasks(page, size, token)
{
    let response;
    try{
        const payload = jwt.verify(token, SECRETE_KEY); //Authorization

        //Pagination Calculation
        const skip = (page - 1) * size;

        const tasks = await Tasks.find({createdby: payload.crid})
                            .skip(skip)         //Skip records for pagination
                            .limit(size)        //Records per page
                            .sort({_id: 1});     //Ascending order by _id (-1 for Descending order)
        
        const totalRecords = await Tasks.countDocuments({createdby: payload.crid});

        response = {code: 200, 
                    page: page, 
                    size: size, 
                    totalpages: Math.ceil(totalRecords / size),
                    tasks: tasks
                 };
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function getTask(id, token)
{
    let response;
    try{
        const payload = jwt.verify(token, SECRETE_KEY); //Authorization
        const task = await Tasks.findById(id); //Read Task by ID
        response = {code: 200, task: task};
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function updateTask(id, data, token)
{
    let response;
    try{
        const payload = jwt.verify(token, SECRETE_KEY);

        data.vector = await vectorService.generateVector(data.title + " " + data.description);
        
        //await Tasks.findByIdAndUpdate(id, data);
        await Tasks.findOneAndUpdate({_id: id}, data);
        response = {code: 200, message: "Task updated successfully"};
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function deleteTask(id, token)
{
    let response;
    try{
        const payload = jwt.verify(token, SECRETE_KEY);
        //await Tasks.findByIdAndDelete(id);
        await Tasks.findOneAndDelete({_id: id});
        response = {code: 200, message: "Task has been deleted"};
    }catch(e){
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function vectorSearch(key, token)
{
    let response;
    try{
        const payload = jwt.verify(token, SECRETE_KEY); //Authorization
        const searchVector = await vectorService.generateVector(key);
        
        const tasks = await Tasks.find({createdby: payload.crid});

        const searchResult = tasks.map(task => {
            const similarity = vectorService.cosineSimilarity(
                searchVector,
                task.vector
            );
            console.log(task.title, similarity);
            return {...task._doc, similarity};
        })
        .filter(task => task.similarity > 0.10)
        .sort((a,b) => b.similarity - a.similarity)
        .slice(0, 5); 

        response = {code: 200, tasks: searchResult};
    }catch(e){
        response = {code: 500, message: e.message};
    }
    return response;
}