'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
// import { AuthError, User } from 'next-auth';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({invalid_type_error: 'Please select a customer.',}),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {invalid_type_error: 'Please select an invoice status.',}),
  date: z.string(),
});

const UserSchema = z.object({
    id: z.string(),
    name: z.string({invalid_type_error: 'Please enter a name.',}),
    email: z.string().email({message: 'Please enter a proper email address.',}),
    password: z.string({invalid_type_error: 'Please enter a password that is at least six characters long',}),
    otp: z.string({invalid_type_error: 'Please enter a otp',})
});



export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };

export type UserState = {
    errors?: {
      name?: string[];
      email?: string[];
      password?: string[];
      otp?: string[];
    };
    message?: string | null;
    qrCode?: string | null;
  };

  const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    // Insert data into the database
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        // If a database error occurs, return a more specific error.
        console.log(error);
        return {
        message: 'Database Error: Failed to Create Invoice.',
        };
    }
    
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
        
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    const amountInCents = amount * 100;
   
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  }

// export async function authenticate(
//     prevState: string | undefined,
//     formData: FormData,
//   ) {
//     try {
//       await signIn('credentials', formData);
//     } catch (error) {
//       if (error instanceof AuthError) {
//         switch (error.type) {
//           case 'CredentialsSignin':
//             return 'Invalid credentials.';
//           default:
//             return 'Something went wrong.';
//         }
//       }
//       throw error;
//     }
//   }

const LoginUser = UserSchema.omit({ id: true, name: true});

export async function authenticate(prevState: UserState, formData: FormData) {

    const validatedFields = LoginUser.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        otp: formData.get('otp')
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Register User.',
        };
    }
    const { email, password, otp } = validatedFields.data;

    // const parsedCredentials = z
    //   .object({ email: z.string().email(), password: z.string().min(6), otp: z.string() })
    //   .safeParse(Object.fromEntries(formData.entries()));

    // console.log(Object.fromEntries(formData.entries()));
  
    // if (!parsedCredentials.success) {
    //   throw new Error('Invalid credentials');
    // }
  
    // const { email, password, otp } = parsedCredentials.data;
    const user = await getUser(email);
    // console.log(user);
    if (!user) {
    //   throw new AuthError('CredentialsSignin');
      return {
        message: 'Invalid password',
      };
    }
  
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
    //   throw new AuthError('CredentialsSignin');
      return {
        message: 'Invalid credentials',
      };
    }
  
    if (otp) {
      const isValidOtp = authenticator.verify({ token: otp, secret: user.otpsecret });
      if (!isValidOtp) {
        // throw new AuthError('Invalid OTP');
        return {
            // errors: { otp: 'Invalid OTP code' },
            message: 'Invalid OTP, please try again.',
        };
      }
      console.log("otp is valid")
    }
    // } else {
    //   return { };
    // }
    await signIn('credentials', formData);
    // redirect('/dashboard');
    // return { user: { id: user.id, name: user.name, email: user.email } }; // Return only necessary user details;
    return {};
  }

  const RegisterUser = UserSchema.omit({ id: true, otp: true });

  // Validate form using Zod
  

  export async function registerUser(prevState: UserState, formData: FormData) {
    const validatedFields = RegisterUser.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register User.',
    };
  }
  const { name, email, password } = validatedFields.data;
    
    // const parsedData = z
    //   .object({name: z.string(), email: z.string().email(), password: z.string().min(6) })
    //   .safeParse(Object.fromEntries(formData.entries()));
  
    // if (!parsedData.success) {
    //   throw new Error('Invalid registration data');
    // }
  
    // const {name, email, password } = parsedData.data;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Generate OTP secret
    const otpSecret = authenticator.generateSecret();

//     await sql `ALTER TABLE users ADD COLUMN otpSecret TEXT`;
//     console.log(await sql`SELECT column_name, data_type
// FROM information_schema.columns
// WHERE table_name = 'users'`)
  
    // Save user to database
    try {
        await sql`INSERT INTO users (name, email, password, otpSecret) 
          VALUES (${name}, ${email}, ${hashedPassword}, ${otpSecret})`;
      } catch (error) {
        console.error('Registration error:', error);
        
        // Check for duplicate email error (PostgreSQL error code 23505)
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
          return {
            errors: { email: ['This email is already registered'] },
            message: 'Registration failed - email already exists',
          };
        }
        
        return {
          errors: {},
          message: 'Database Error: Failed to create user.',
        };
      }
  
    // Generate OTP Auth URL
    const otpAuthUrl = authenticator.keyuri(email, 'YourAppName', otpSecret);
  
    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpAuthUrl);
    // console.log(qrCode);
    return {qrCode: qrCode};
  }

async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}