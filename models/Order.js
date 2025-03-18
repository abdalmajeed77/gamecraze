import mongoose from "mongoose";



const orderSchema = new mongoose.Schema({
    userId: { type: 'string', required: true },
    items: [
        {
            gameid{type :'Number', required: true},
            product: { type: 'string', required: true },
            priceoptions: [
                {
                    price: { type: 'number', required: true },
                    describtion: { type: 'string', required: true }
                }
            ]
            status:{type:'string', required: true, default: 'pending'},
            date: { type: 'Date', required: true, default: Date.now }
            
        }
    ]
});
const order = mongoose.models.order || mongoose.model('order', orderSchema);
export default order;