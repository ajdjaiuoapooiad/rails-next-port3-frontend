// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createNewPost(formData: FormData) {
  const content = formData.get('content') as string;
  // データベースへの保存処理など

  // 成功したら関連するパスのキャッシュを再検証
  revalidatePath('/posts');
}