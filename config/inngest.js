import { EmailAddress } from "@clerk/nextjs/dist/types/server";
import { Inngest } from "inngest";
import { connect } from "mongoose";
import ConnectDB from "./db";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "GAMECRAZE-next" });

export const syncUserCreation =inngest.createFunction(
    {
        id: 'sync user from clerk',
    },
    {
        event: 'clerk/user.created'
        async ({event}) {
            const{ id,first_name,last_name,image_url} = event.data;
            const userData ={
                _id:id,
                name:first_name+''+last_name,
                email:email_address[0].email_address,                ,
                imageurl:image_url,

            }
            await ConnectDB();
            await User.create(userData);
        }
    }
)
export const syncUserUpdate =inngest.createFunction(
    {
        id: 'sync user from clerk',
    },
    {
        event: 'clerk/user.updated'
        async ({event}) {
            const{ id,first_name,last_name,image_url} = event.data;
            const userData ={
                _id:id,
                name:first_name+''+last_name,
                email:email_address[0].email_address,                ,
                imageurl:image_url,

            }
            await ConnectDB();
            await User.findByIdAndUpdate(id,userData);
        }
    }
)
export const syncUserDeletion =inngest.createFunction(
    {
        id: 'sync user from clerk',
    },
    {
        event: 'clerk/user.deleted'
        async ({event}) {
            const{ id} = event.data;
            await ConnectDB();
            await User.findByIdAndDelete(id);   

        }                   
    }
)

    