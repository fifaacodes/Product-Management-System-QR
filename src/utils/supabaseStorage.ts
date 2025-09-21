import { supabase } from '../lib/supabase';
import type { ProductFile, ProductData } from '../types';

export class SupabaseStorage {
  static async saveFile(file: ProductFile): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('product_files')
      .insert({
        name: file.name,
        type: file.type,
        data: file.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  static async updateFile(id: string, updates: Partial<ProductFile>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current file data for versioning
    const { data: currentFile } = await supabase
      .from('product_files')
      .select('*')
      .eq('id', id)
      .single();

    if (currentFile) {
      // Get the highest version number for this file
      const { data: versions } = await supabase
        .from('file_versions')
        .select('version_number')
        .eq('file_id', id)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Save current version before updating
      await supabase
        .from('file_versions')
        .insert({
          file_id: id,
          version_number: nextVersion,
          data: currentFile.data,
          user_id: user.id,
        });
    }

    // Update the file
    const { error } = await supabase
      .from('product_files')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async getFiles(): Promise<ProductFile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('product_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type as 'excel' | 'raw',
      data: file.data as ProductData[],
      createdAt: new Date(file.created_at),
      updatedAt: new Date(file.updated_at),
    }));
  }

  static async getFile(id: string): Promise<ProductFile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('product_files')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      type: data.type as 'excel' | 'raw',
      data: data.data as ProductData[],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  static async deleteFile(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('product_files')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  static async getFileVersions(fileId: string): Promise<Array<{ version: number; data: ProductData[]; createdAt: Date }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('file_versions')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', user.id)
      .order('version_number', { ascending: false });

    if (error) throw error;

    return data.map(version => ({
      version: version.version_number,
      data: version.data as ProductData[],
      createdAt: new Date(version.created_at),
    }));
  }
}