// controllers/reportController.js
import Report from '../models/Report.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import multer from 'multer';
import { uploadImageToImgur } from '../imgurService.js';

// Configuración de multer para manejar la subida de imágenes
const multerStorage = multer.memoryStorage();
const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            const error = new Error('Solo se permiten archivos de imagen');
            error.status = 400;
            return cb(error, false);
        }
        cb(null, true);
    },
});

// Crear un reporte
export const createReport = [
    upload.array('images', 5), // Permitir hasta 5 imágenes
    async (req, res) => {
        try {
            const { reportedId, productId, description,category } = req.body;
            const reporterId = req.user.id;

            // Verificar si el producto y el usuario reportado existen
            const product = await Product.findById(productId);
            const reportedUser = await User.findById(reportedId);

            if (!product || !reportedUser) {
                return res.status(404).json({ error: 'Producto o usuario reportado no encontrado' });
            }

            // Subir imágenes del reporte a Imgur
            const images = await Promise.all(
                req.files.map(async (file) => {
                    try {
                        return await uploadImageToImgur(file); // Usa la función de Imgur
                    } catch (error) {
                        console.error(`Error al subir la imagen ${file.originalname}:`, error);
                        return null;
                    }
                })
            );

            const validImages = images.filter((url) => url !== null); // Filtra imágenes no subidas
            // Crear el reporte en la base de datos
            const newReport = new Report({
                reporter: reporterId,
                reported: reportedId,
                product: productId,
                reportImages: validImages,
                description,
                category,
            });

            await newReport.save();
            res.status(201).json(newReport);
        } catch (error) {
            console.error('Error creando el reporte:', error.message);
            res.status(500).json({ error: 'No se pudo crear el reporte.', details: error.message });
        }
    }
];

// Obtener todos los reportes
export const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reporter', 'name email')
            .populate('reported', 'name email')
            .populate('product', 'name images');
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error al obtener los reportes:', error.message);
        res.status(500).json({ error: 'Error al obtener los reportes' });
    }
};

// Actualizar el estado de un reporte
export const updateReportStatus = async (req, res) => {
    const { reportId } = req.params;
    const { status } = req.body;

    try {
        const report = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        res.json({ message: 'Estado del reporte actualizado', report });
    } catch (error) {
        console.error('Error al actualizar el estado del reporte:', error.message);
        res.status(500).json({ message: 'Error al actualizar el estado del reporte', error });
    }
};

// Eliminar un reporte
export const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.reportId;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        await Report.findByIdAndDelete(reportId);
        res.status(200).json({ message: 'Reporte eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el reporte:', error.message);
        res.status(500).json({ message: 'Error al eliminar el reporte', error });
    }
};

// Obtener reportes por ID de usuario (reportado o reportero)
export const getReportsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Buscar reportes donde el usuario sea el reportero o el reportado
        const reports = await Report.find({
            $or: [{ reporter: userId }, { reported: userId }],
        })
            .populate('reporter', 'name email')
            .populate('reported', 'name email')
            .populate
            .populate('product', 'name images');

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reportes para este usuario' });
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error al obtener los reportes por ID de usuario:', error.message);
        res.status(500).json({ error: 'Error al obtener los reportes' });
    }
};

export const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId)
            .populate('reporter', 'name email') // Datos del usuario que hizo el reporte
            .populate('reported', 'name email') // Datos del usuario que fue reportado
            .populate('product', 'name price description') // Datos del producto reportado
            .lean();

        if (!report) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error("Error al obtener el reporte:", error.message);
        res.status(500).json({ error: 'Error al obtener el reporte' });
    }
};

export const getReportsForReportedUser = async (req, res) => {
    try {
        const { userId } = req.params; // ID del usuario que ha sido reportado

        const reports = await Report.find({ reported: userId })
            .populate('reporter') // Trae todos los datos del usuario que reportó
            .populate('reported') // Trae todos los datos del usuario reportado
            .populate('product') // Trae todos los datos del producto relacionado
            .lean();

        if (!reports.length) {
            return res.status(404).json({ message: 'No hay reportes para este usuario' });
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error("Error al obtener reportes para el usuario reportado:", error.message);
        res.status(500).json({ error: 'Error al obtener reportes' });
    }
};