// import { NextApiRequest, NextApiResponse } from 'next';
// import { registerUser } from '@/app/lib/actions';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//       return res.status(405).json({ error: 'Method not allowed' });
//     }
  
//     try {
//     //   const formData = new FormData();
//     //   Object.entries(req.body).forEach(([key, value]) => {
//     //     formData.append(key, value as string);
//     //   });
  
//       const { qrCode } = await registerUser(formData);
//       res.status(200).json({ qrCode });
//     } catch (error) {
//       res.status(500).json({ error: 'Registration failed' });
//     }
//   }