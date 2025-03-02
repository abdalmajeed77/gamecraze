import { NextResponse } from 'next/server';
import ConnectDB from '@/config/db';
import Product from '@/models/Product';

export async function POST(request) {
    try {
        await ConnectDB();
        const data = await request.json();
        const newProduct = new Product(data);
        await newProduct.save();
        return NextResponse.json({ success: true, data: newProduct });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
