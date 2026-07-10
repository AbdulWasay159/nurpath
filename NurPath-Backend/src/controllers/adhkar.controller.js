const Adhkar = require('../models/Adhkar.model');

/**
 * @desc    Get all adhkar
 * @route   GET /api/adhkar
 * @access  Public
 */
exports.getAdhkar = async (req, res, next) => {
  try {
    const { timing } = req.query;
    let query = { isActive: true };

    if (timing) {
      query.timing = timing;
    }

    const adhkar = await Adhkar.find(query).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: adhkar.length,
      data: adhkar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single adhkar
 * @route   GET /api/adhkar/:id
 * @access  Public
 */
exports.getSingleAdhkar = async (req, res, next) => {
  try {
    const adhkar = await Adhkar.findById(req.params.id);

    if (!adhkar) {
      return res.status(404).json({
        success: false,
        message: 'Adhkar not found',
      });
    }

    res.status(200).json({
      success: true,
      data: adhkar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new adhkar
 * @route   POST /api/adhkar
 * @access  Private/Admin
 */
exports.createAdhkar = async (req, res, next) => {
  try {
    const adhkar = await Adhkar.create(req.body);

    res.status(201).json({
      success: true,
      data: adhkar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update adhkar
 * @route   PUT /api/adhkar/:id
 * @access  Private/Admin
 */
exports.updateAdhkar = async (req, res, next) => {
  try {
    let adhkar = await Adhkar.findById(req.params.id);

    if (!adhkar) {
      return res.status(404).json({
        success: false,
        message: 'Adhkar not found',
      });
    }

    adhkar = await Adhkar.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: adhkar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete adhkar
 * @route   DELETE /api/adhkar/:id
 * @access  Private/Admin
 */
exports.deleteAdhkar = async (req, res, next) => {
  try {
    const adhkar = await Adhkar.findById(req.params.id);

    if (!adhkar) {
      return res.status(404).json({
        success: false,
        message: 'Adhkar not found',
      });
    }

    await adhkar.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
