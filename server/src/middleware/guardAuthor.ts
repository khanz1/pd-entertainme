import { ForbiddenError, NotFoundError, withErrorHandler } from "../utils/error";
import { AuthenticatedRequest } from "../types/express.type";
import { Favorite } from "../models";

export const guardAuthor = withErrorHandler<AuthenticatedRequest>(
  async (req, res, next) => {
    const favorite = await Favorite.findByPk(req.params.id);
    if (!favorite) {
      throw new NotFoundError("Favorite not found");
    }

    if (req.user?.id !== favorite.userId) {
      throw new ForbiddenError(
        "You are not authorized to access this resource"
      );
    }
    next();
  }
);
