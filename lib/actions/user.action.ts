'use server';

import { signIn, signOut } from "@/auth";
import { signInFormSchema, signUpFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { Prisma } from "@prisma/client";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: 'Invalid email or password' };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut({ redirectTo: '/' });
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const plainPassword = user.password;

    user.password = await hashSync(user.password);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

export async function saveUserBirthData(
  userId: string,
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number,
  birthLocation: string
) {
  await prisma.user.update({
    where: { id: userId },
    data: { birthLocation },
  });
  return await prisma.birthChart.create({
    data: {
      userId,
      birthDate: new Date(birthDate),
      birthTime: new Date(`${birthDate}T${birthTime}`),
      lat,
      lon,
      rawHorizonsData: {}, // initially empty object
      vedicData: {},       // initially empty object
      planetaryData: {}    // initially empty object
    },
  })
}

export async function getUserBirthDate(userId: string) {
  const birthChart = await prisma.birthChart.findUnique({
      where: { userId },
      select: { birthDate: true },
    });
    return birthChart?.birthDate
}

export async function getUserBirthTime(userId: string) {
  const birthChart = await prisma.birthChart.findUnique({
      where: { userId },
      select: { birthTime: true },
    });
    return birthChart?.birthTime
}

export async function getUserBirthLocation(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { birthLocation: true },
  });
  return user?.birthLocation;
}

export async function getUserRawHorizonsData(userId: string): Promise<Prisma.JsonValue> {
  // Find the BirthChart record for the given userId and select only the rawHorizonsData field.
  const birthChart = await prisma.birthChart.findUnique({
    where: { userId },
    select: { rawHorizonsData: true }
  });

  if (!birthChart) {
    throw new Error('No birth chart found for this user');
  }

  return birthChart.rawHorizonsData;
}

export async function getUserVedicData(userId: string): Promise<Prisma.JsonValue> {
  const chart = await prisma.birthChart.findUnique({
    where: { userId },
    select: { vedicData: true }
  });

  if (!chart) {
    throw new Error('No birth chart found for this user');
  }

  return chart.vedicData;
}