import { useState, useEffect } from 'react';
import UserForm from './components/UserForm';
import ChatRoom from './components/ChatRoom';
import { useModal } from './context/ModalContext';
import ModalCrearGrupo from './components/ModalCrearGrupo';

function App() {
  const [user, setUser] = useState(null);
  const { isModalOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para crear el grupo
    console.log('Formulario enviado');
    closeModal();
};

  return (
    <div>
      <h2>Grupo 4</h2>
      {!user ? (
        <UserForm onConnect={setUser} />
      ) : (
        <div>
          <ChatRoom user={user} onLogout={() => setUser(null)} />
          
        </div>
      )}
    </div>
  );
}

export default App;