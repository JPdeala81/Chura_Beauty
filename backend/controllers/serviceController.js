import Service from '../models/Service.js';

export const getAllServices = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      duration,
      mainImageIndex,
      displayStyle,
      availability,
      specificDates,
      checkboxOptions,
    } = req.body;

    const images = req.files ? req.files.map((file) => file.path) : [];

    const service = await Service.create({
      title,
      description,
      category,
      price,
      duration,
      images,
      mainImageIndex: mainImageIndex || 0,
      displayStyle: displayStyle || 'card',
      availability: availability ? JSON.parse(availability) : [],
      specificDates: specificDates ? JSON.parse(specificDates) : [],
      checkboxOptions: checkboxOptions ? JSON.parse(checkboxOptions) : [],
      isActive: true,
    });

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      duration,
      mainImageIndex,
      displayStyle,
      availability,
      specificDates,
      checkboxOptions,
      isActive,
    } = req.body;

    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const images = req.files
      ? req.files.map((file) => file.path)
      : service.images;

    service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        price,
        duration,
        images,
        mainImageIndex: mainImageIndex || service.mainImageIndex,
        displayStyle: displayStyle || service.displayStyle,
        availability: availability ? JSON.parse(availability) : service.availability,
        specificDates: specificDates ? JSON.parse(specificDates) : service.specificDates,
        checkboxOptions: checkboxOptions ? JSON.parse(checkboxOptions) : service.checkboxOptions,
        isActive: isActive !== undefined ? isActive : service.isActive,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
