# Biometric Authentication System

এই মডিউলটি Probash Pay অ্যাপের জন্য ফিঙ্গারপ্রিন্ট বা বায়োমেট্রিক লগইন সিস্টেম হ্যান্ডেল করে। এটি FIDO2 স্ট্যান্ডার্ডের একটি সহজ রূপ (Asymmetric Cryptography) ব্যবহার করে।

## How it works (Flow)

### ১. Registration (Enrollment)
ব্যবহারকারী যখন প্রথমবার PIN দিয়ে লগইন করবেন, তখন তিনি ফিঙ্গারপ্রিন্ট সেটআপ করতে পারবেন।
1. **GET `/biometric/challenge`**: সার্ভার থেকে একটি র্যান্ডম স্ট্রিং (Challenge) আনতে হবে।
2. **Device Action**: মোবাইল ডিভাইসে একটি RSA Key Pair তৈরি করতে হবে। প্রাইভেট কী দিয়ে Challenge-টি সাইন (Sign) করতে হবে।
3. **POST `/biometric/register`**: নিচের ডাটাগুলো পাঠাতে হবে:
   - `challengeId`: যেটা ১ নম্বর স্টেপে পেয়েছেন।
   - `publicKey`: ডিভাইসে তৈরি হওয়া Public Key (PEM format)।
   - `signature`: Challenge-টির ডিজিটাল সিগনেচার (Base64)।
   - `deviceId`: ডিভাইসের একটি ইউনিক আইডি।

### ২. Login (Authentication)
পরবর্তীতে PIN ছাড়াই লগইন করার জন্য:
1. **POST `/biometric/challenge`**: বডিতে `userId` পাঠিয়ে একটি লগইন চ্যালেঞ্জ নিতে হবে।
2. **Device Action**: ডিভাইসের বায়োমেট্রিক প্রম্পট (Fingerprint/FaceID) দেখিয়ে সংরক্ষিত প্রাইভেট কী দিয়ে চ্যালেঞ্জটি সাইন করতে হবে।
3. **POST `/biometric/verify`**: সাইন করা চ্যালেঞ্জ এবং সিগনেচার পাঠাতে হবে। সার্ভার যদি সিগনেচার ভেরিফাই করতে পারে, তবে আপনাকে নতুন JWT টোকেন প্রদান করবে।

## API Endpoints (Check Swagger/Scalar for details)
- `GET /biometric/challenge`: (Auth Required) Setup challenge.
- `POST /biometric/register`: (Auth Required) Register device.
- `POST /biometric/challenge`: (Public) Login challenge via `userId`.
- `POST /biometric/verify`: (Public) Final login verification.
- `GET /biometric/devices`: (Auth Required) List registered devices.
- `DELETE /biometric/device/:deviceId`: (Auth Required) Deactivate a device.

## Security Features
- **Replay Protection**: প্রতিটি চ্যালেঞ্জ মাত্র একবার ব্যবহার করা যায় এবং ৫ মিনিট পর এক্সপায়ার হয়ে যায়।
- **Asymmetric Encryption**: সার্ভারে কোনো প্রাইভেট কী থাকে না, শুধুমাত্র পাবলিক কী থাকে।
- **Device Binding**: প্রতিটি ফিঙ্গারপ্রিন্ট একটি নির্দিষ্ট ডিভাইসের সাথে যুক্ত থাকে।
