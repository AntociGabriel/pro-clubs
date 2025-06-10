import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CLOUDINARY_CLOUD_NAME = 'dcxyabzas';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned-profile';

export default function CreateTeamForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) {
      setFormData(prev => ({ ...prev, logo: data.secure_url }));
      setLogoPreview(data.secure_url);
    } else {
      setError('Error uploading logo');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team');
      }

      router.push('/teams');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Team</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Team Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter team name"
          />
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            Team Logo
          </label>
          <div className="mt-2 flex items-center gap-4">
            {logoPreview ? (
              <div className="relative w-16 h-16">
                <Image
                  src={logoPreview}
                  alt="Team logo preview"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Logo</span>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
} 