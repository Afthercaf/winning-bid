import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Typography,
    TextField,
    Button,
    Avatar,
} from '@mui/material';

const UserWinning = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                `https://winning-bid.onrender.com/api/users?page=${page}&limit=20`
            );
            setUsers(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSearch = () => {
        // Implementar lógica para búsqueda (opcional)
        console.log('Buscando:', search);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Usuarios Registrados
            </Typography>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TextField
                    label="Buscar usuario"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" color="primary" onClick={handleSearch}>
                    Buscar
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Avatar</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Fecha de Registro</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <Avatar src={`https://winning-bid.onrender.com/${user.avatar}`} />
                                </TableCell>    
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone || 'N/A'}</TableCell>
                                <TableCell>{user.role?.roleName || 'Sin rol'}</TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </div>
        </div>
    );
};

export default UserWinning;
