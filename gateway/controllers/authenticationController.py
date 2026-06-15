from fastapi import APIRouter, Header
from models.schemas import SignupSchema, SigninSchema, UsersSchema
import httpx
import os
from dotenv import load_dotenv

router = APIRouter(prefix="/authservice")

load_dotenv()

SPRING_URL = os.getenv("SPRING_URL");

@router.post("/signup")
async def signup(U: SignupSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(SPRING_URL + "/user/signup", json=U.model_dump())
    return response.json()

@router.post("/signin")
async def signin(U: SigninSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(SPRING_URL + "/user/signin", json=U.model_dump())
    return response.json()

@router.get("/rbac")
async def rbac(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "/user/rbac", headers={'Token': Token})
    return response.json()

@router.get("/profile")
async def getProfile(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "/user/profile", headers={'Token': Token})
    return response.json()

@router.get("/getallusers/{PAGE}/{SIZE}")
async def getAllUsers(PAGE: int, SIZE: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"/user/getallusers/{PAGE}/{SIZE}", headers={'Token': Token})
    return response.json()

@router.post("/saveuser")
async def saveUser(data: UsersSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(SPRING_URL + f"/user/saveuser", json=data.model_dump(), headers={'Token': Token})
    return response.json()

@router.get("/getuser/{ID}")
async def getUse(ID: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"/user/getuser/{ID}", headers={'Token': Token})
    return response.json()

@router.put("/updateuser/{ID}")
async def updateUser(ID: int, data: UsersSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.put(SPRING_URL + f"/user/updateuser/{ID}", json=data.model_dump(), headers={'Token': Token})
    return response.json()

@router.delete("/deleteuser/{ID}")
async def deleteUser(ID: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.delete(SPRING_URL + f"/user/deleteuser/{ID}", headers={'Token': Token})
    return response.json()

@router.get("/searchuser/{KEY}")
async def searchUser(KEY: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"/user/searchuser/{KEY}")
    return response.json()