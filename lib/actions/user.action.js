"use server";
import { User } from "@/models/User";
import { conncet } from "@/config/db";

export async function createUser(user) {
    try {
        await conncet();
        const newUser = new User(user);
        return newUser.save();
    } catch (error) {
        console.error(error);
    }
}