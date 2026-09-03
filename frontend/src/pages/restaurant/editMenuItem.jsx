import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import menuService from '../../services/menuService';
import MenuItemForm from './menuItemForm';
import Loading from '../../components/Loading';

const EditMenuItem = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    menuService
      .getMenuItem(id)
      .then((data) => setItem(data.menuItem))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <Loading label="Loading item" />;
  if (!item) return <p className="px-6 py-10 font-sans text-sm text-ink/60">Item not found.</p>;

  return <MenuItemForm mode="edit" initialData={item} />;
};

export default EditMenuItem;