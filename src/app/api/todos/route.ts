import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

const TODOS_COLLECTION = "todos";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: Timestamp | null;
}

export async function GET() {
  try {
    const q = query(collection(db, TODOS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const todos: Todo[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Todo, "id">),
    }));
    return NextResponse.json({ todos });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    if (!body.text || !body.text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    const docRef = await addDoc(collection(db, TODOS_COLLECTION), {
      text: body.text.trim(),
      completed: false,
      createdAt: serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; text?: string; completed?: boolean };
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const todoRef = doc(db, TODOS_COLLECTION, body.id);
    const updates: Record<string, unknown> = {};
    if (typeof body.text === "string") updates.text = body.text.trim();
    if (typeof body.completed === "boolean") updates.completed = body.completed;
    await updateDoc(todoRef, updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteDoc(doc(db, TODOS_COLLECTION, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}


