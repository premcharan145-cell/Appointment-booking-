from fastapi import APIRouter, Header
from models.schemas import TaskSchema
import httpx
import os
from dotenv import load_dotenv

router = APIRouter(prefix="/taskservice")

load_dotenv()

NODE_URL = os.getenv("NODE_URL")

@router.post("/createtask")
async def createTask(data: TaskSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(NODE_URL + f"/task/createtask", json=data.model_dump(), headers={'Token': Token})
    return response.json()

@router.get("/getalltasks/{PAGE}/{SIZE}")
async def getAllTasks(PAGE: int, SIZE: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/task/getalltasks/{PAGE}/{SIZE}", 
                                    headers={'Token': Token})
    return response.json()

@router.get("/gettask/{ID}")
async def getTask(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/task/gettask/{ID}", 
                                    headers={'Token': Token})
    return response.json()


@router.put("/updatetask/{ID}")
async def updateTask(ID: str, data: TaskSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.put(NODE_URL + f"/task/updatetask/{ID}", 
                                    json=data.model_dump(),
                                    headers={'Token': Token})
    return response.json()

@router.delete("/deletetask/{ID}")
async def deleteTask(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.delete(NODE_URL + f"/task/deletetask/{ID}", 
                                    headers={'Token': Token})
    return response.json()


@router.get("/vectorsearch/{KEY}")
async def vectorSearch(KEY: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/task/vectorsearch/{KEY}", 
                                    headers={'Token': Token})
    return response.json()
