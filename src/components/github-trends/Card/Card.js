import React from 'react';
import PropTypes from 'prop-types';

import SVG from './SVG';
import { classnames } from '../../utils';

export const Image = ({ imageSrc, compact, userId = 'iKislay' }) => {
  const fullImageSrc = `https://api.githubtrends.io/user/svg/${userId}/${imageSrc}`;

  return (
    <div className="relative h-full w-full">
      <SVG
        className="object-cover h-full w-full"
        url={fullImageSrc}
        compact={compact}
      />
    </div>
  );
};

Image.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  compact: PropTypes.bool,
};

Image.defaultProps = {
  compact: false,
};

export const Card = ({ title, description, imageSrc, selected, compact }) => {
  return (
    <div
      className={classnames(
        'p-6 rounded border-2',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:bg-gray-50',
      )}
    >
      <h2 className="text-xl font-medium title-font text-gray-900">{title}</h2>
      <p className="text-base leading-relaxed mt-2 mb-4">{description}</p>
      <Image imageSrc={imageSrc} compact={compact} />
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  compact: PropTypes.bool,
};

Card.defaultProps = {
  selected: false,
  compact: false,
};
