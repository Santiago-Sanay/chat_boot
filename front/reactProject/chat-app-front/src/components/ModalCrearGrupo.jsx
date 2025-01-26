import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";

function ModalCrearGrupo({ isOpen, onClose, onCreateRoomModal }) {
    const [newRoomId, setNewRoomId] = useState('');

    const handleCreateRoomModal = (e) => {
        e.preventDefault();
        if (newRoomId.trim() !== '') {
            if (typeof onCreateRoomModal === 'function') {
                onCreateRoomModal(newRoomId);
                setNewRoomId('');
                onClose();
            } else {
                console.error("onCreateRoomModal is not a function");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className='modal-overlay'>
            
                <Dialog open={isOpen} onClose={onClose} >
                <div  className="modal-content modalCentrao">
                    <DialogHeader><h3>Crear Chat en Grupo</h3></DialogHeader>
                    <DialogBody className="p-6">
                        <form id="createRoomForm" onSubmit={handleCreateRoomModal} className="modalCentrao">
                            <p>Ingrese el nombre del grupo</p>
                            <input
                                type="text"
                                id="roomId"
                                value={newRoomId}
                                onChange={(e) => setNewRoomId(e.target.value)}
                                required
                                className="input"
                            />
                            <DialogFooter>
                                <div className='grid-2col-boton modalCentrao'>
                                <Button
                                    variant="gradient"
                                    color="green"
                                    type="submit"
                                    className= 'boton-normal'
                                >
                                    Crear
                                </Button>
                                <Button
                                    variant="text"
                                    color="red"
                                    onClick={onClose}
                                    className= 'boton-normal'
                                >
                                    Cancelar
                                </Button>
                                </div>
                                
                            </DialogFooter>
                        </form>
                    </DialogBody>
                    </div>
                </Dialog>
            

        </div>
    );
}

export default ModalCrearGrupo;