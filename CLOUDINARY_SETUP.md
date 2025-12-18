# Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a cloud-based media management platform that provides:

1. **Image & Video Storage**: Secure cloud storage for all your media files
2. **Automatic Optimization**: Automatically optimizes images for web (compression, format conversion)
3. **On-the-fly Transformations**: Resize, crop, apply filters without storing multiple versions
4. **CDN Delivery**: Fast global content delivery network
5. **Responsive Images**: Generate different sizes automatically for mobile/tablet/desktop
6. **Format Selection**: Automatically serves WebP/AVIF to supported browsers, JPEG/PNG to others

## Getting Started

### Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account (25GB storage, 25GB bandwidth/month)
3. After signup, you'll see your **Dashboard**

### Step 2: Get Your Credentials

From your Cloudinary Dashboard, you'll find:

- **Cloud Name**: Your unique cloud identifier (e.g., `dxy123abc`)
- **API Key**: Your API key (e.g., `123456789012345`)
- **API Secret**: Your secret key (keep this secure!)

### Step 3: Install Cloudinary SDK

```bash
# In your backend directory
cd backend
npm install cloudinary
```

### Step 4: Set Environment Variables

Add to your `.env` file in the `backend` directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 5: Configure Cloudinary in Your Backend

The environment variables are already configured in `backend/src/config/env.validation.ts`. You just need to:

1. Create a Cloudinary service module
2. Set up upload endpoints
3. Use it in your product creation/update routes

## How It Works

### Upload Flow

1. **Frontend** → User selects image file
2. **Backend** → Receives file, uploads to Cloudinary
3. **Cloudinary** → Processes, optimizes, and stores the image
4. **Cloudinary** → Returns public URL
5. **Backend** → Saves URL to database
6. **Frontend** → Displays image using the URL

### Image URLs Structure

Cloudinary URLs follow this pattern:

```
https://res.cloudinary.com/{cloud_name}/{resource_type}/{type}/v{version}/{public_id}.{format}
```

Example:

```
https://res.cloudinary.com/mycloud/image/upload/v1234567890/products/laptop-1.jpg
```

### Transformations (On-the-fly)

You can transform images by adding parameters to the URL:

```
https://res.cloudinary.com/mycloud/image/upload/w_500,h_500,c_fill/products/laptop-1.jpg
```

This creates a 500x500 cropped image without storing a separate file!

## Common Use Cases

### 1. Product Images

- Store multiple images per product
- Generate thumbnails automatically
- Optimize for web performance

### 2. User Avatars

- Crop to square automatically
- Generate multiple sizes (thumb, small, medium, large)

### 3. Category Banners

- Responsive banners that adapt to screen size
- Automatic format optimization

## Next Steps

After setting up your account and credentials:

1. ✅ Install `cloudinary` package in backend
2. ✅ Create Cloudinary service module
3. ✅ Add upload endpoint for images
4. ✅ Integrate with product creation/update
5. ✅ Update frontend to upload images through backend
6. ✅ Test image upload and display

## Example Upload Code

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file
const result = await cloudinary.uploader.upload(filePath, {
  folder: "products",
  transformation: [
    { width: 800, height: 800, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
});

console.log(result.secure_url); // The URL to use in your database
```

## Security Best Practices

1. **Never expose API Secret** in frontend code
2. **Always upload through backend** (never direct from frontend)
3. **Use signed uploads** for additional security
4. **Set upload presets** to limit file types and sizes
5. **Use folder structure** to organize uploads (e.g., `products/`, `users/`)

## Pricing Tiers

- **Free**: 25GB storage, 25GB bandwidth/month
- **Plus**: $89/month - 100GB storage, 100GB bandwidth
- **Advanced**: $224/month - 500GB storage, 500GB bandwidth

For an e-commerce site, start with Free tier and upgrade as needed.

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Upload API](https://cloudinary.com/documentation/upload_images)

