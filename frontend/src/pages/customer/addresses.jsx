import { useEffect, useState } from 'react';
import userService from '../../services/userService';
import AddressForm from '../../components/AddressForm';
import Loading from '../../components/Loading';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const load = () => {
    setIsLoading(true);
    userService
      .getAddresses()
      .then((data) => setAddresses(data.addresses))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (formData) => {
    await userService.createAddress(formData);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (formData) => {
    await userService.updateAddress(editingAddress._id, formData);
    setEditingAddress(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this address?')) return;
    await userService.deleteAddress(id);
    load();
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Your addresses</h1>
        {!showForm && !editingAddress && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-sans text-sm text-paper hover:bg-indigo-700"
          >
            + Add address
          </button>
        )}
      </div>

      {isLoading ? (
        <Loading label="Loading addresses" />
      ) : (
        <>
          {showForm && (
            <div className="mt-6 rounded-lg border border-ink/10 p-4">
              <AddressForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitLabel="Add address" />
            </div>
          )}

          {editingAddress && (
            <div className="mt-6 rounded-lg border border-ink/10 p-4">
              <AddressForm
                initialData={editingAddress}
                onSubmit={handleUpdate}
                onCancel={() => setEditingAddress(null)}
                submitLabel="Save changes"
              />
            </div>
          )}

          {addresses.length === 0 && !showForm ? (
            <p className="mt-8 font-sans text-sm text-ink/50">No saved addresses yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {addresses.map((addr) => (
                <div key={addr._id} className="flex items-start justify-between gap-4 rounded-lg border border-ink/10 p-4">
                  <div className="font-sans text-sm">
                    <p className="font-medium text-ink">
                      {addr.label} · {addr.name}
                      {addr.isDefault && (
                        <span className="ml-2 rounded-full bg-marigold-100 px-2 py-0.5 text-xs text-marigold-600">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-ink/60">
                      {addr.street ? `${addr.street}, ` : ''}
                      {addr.area}, {addr.city}
                    </p>
                    <p className="text-ink/40">{addr.phone}</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-3 font-sans text-xs">
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setShowForm(false);
                      }}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(addr._id)} className="text-chili-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Addresses;
