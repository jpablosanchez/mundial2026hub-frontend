import ReactCountryFlag from 'react-country-flag';

const SIZES = {
  hero:  { width: '72px', height: '48px', borderRadius: '6px' },
  card:  { width: '30px', height: '20px', borderRadius: '3px' },
  row:   { width: '24px', height: '16px', borderRadius: '2px' },
  polla: { width: '28px', height: '19px', borderRadius: '3px' },
};

const TeamFlag = ({ iso2, size = 'card', style: extStyle }) => {
  if (!iso2) return null;
  const sizeStyle = SIZES[size] || SIZES.card;
  return (
    <ReactCountryFlag
      countryCode={iso2}
      svg
      style={{ display: 'block', objectFit: 'cover', ...sizeStyle, ...extStyle }}
      title={iso2}
    />
  );
};

export default TeamFlag;
