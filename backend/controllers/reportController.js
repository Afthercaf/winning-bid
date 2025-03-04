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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
    upload.array('reportImages', 5), // Permitir hasta 5 imágenes
    async (req, res) => {
        try {
            const { reportedId, productId, description } = req.body;
            const reporterId = req.user.id;

            // Verificar si el producto y el usuario reportado existen
            const product = await Product.findById(productId);
            const reportedUser = await User.findById(reportedId);

            if (!product || !reportedUser) {
                return res.status(404).json({ error: 'Producto o usuario reportado no encontrado' });
            }

            // Subir imágenes del reporte a Imgur
            const reportImages = await Promise.all(
                req.files.map(async (file) => {
                    try {
                        return await uploadImageToImgur(file);
                    } catch (error) {
                        console.error(`Error al subir la imagen ${file.originalname}:`, error);
                        return null;
                    }
                })
            );

            const validReportImages = reportImages.filter(url => url !== null);

            // Crear el reporte en la base de datos
            const newReport = new Report({
                reporter: reporterId,
                reported: reportedId,
                product: productId,
                reportImages: validReportImages,
                description
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