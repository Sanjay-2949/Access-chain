import { useState } from 'react';
import { useAppStore, type EmergencyContact } from '../stores/useAppStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function Contacts() {
  const { emergencyContacts, addEmergencyContact, removeEmergencyContact } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', isPrimary: false });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addEmergencyContact({ ...form, id: Date.now().toString() });
    setForm({ name: '', relationship: '', phone: '', isPrimary: false });
    setShowAdd(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-xl font-bold text-[var(--foreground)]">Contacts</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}>Add contact</Button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Emergency contacts */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Emergency contacts</h2>
          {emergencyContacts.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)] py-3">No emergency contacts yet.</p>
          )}
          <div className="flex flex-col gap-2">
            {emergencyContacts.map((c) => (
              <Card key={c.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-[var(--foreground)]">{c.name}</p>
                    {c.isPrimary && <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 rounded font-semibold">PRIMARY</span>}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{c.relationship} · {c.phone}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeEmergencyContact(c.id)} className="text-[var(--danger)] hover:bg-[var(--danger-bg)]">Remove</Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Trusted contacts (same list in this model) */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Trusted contacts</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Trusted contacts can receive shared journey updates.</p>
        </div>

        {/* Shared journeys */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Shared journeys</h2>
          <p className="text-sm text-[var(--muted-foreground)]">No journeys shared yet. Share your live journey from the journey screen.</p>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-sm border border-[var(--border)] shadow-xl">
            <h3 className="font-display font-bold text-[var(--foreground)] mb-4">Add contact</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              {[{ key: 'name', label: 'Full name', type: 'text' }, { key: 'relationship', label: 'Relationship', type: 'text' }, { key: 'phone', label: 'Phone number', type: 'tel' }].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium block mb-1">{label}</label>
                  <input type={type} value={(form as unknown as Record<string, string>)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" required />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))} className="accent-[var(--primary)]" />
                <span className="text-sm">Set as primary contact</span>
              </label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" fullWidth type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button fullWidth type="submit">Add contact</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
