//
// JavaScript methods to draw Mandelbrot and Julia Sets
//
// version 1.5 - featuring LSM, DEM, BDM, TDM and BDM2 methods, iterations slider, colour palettes, auto draw julia set mode, and zoom mode
//
// (c) 2009-2022 Mike Harris; (c) 1987-1990 Mike Harris & Dan Grace
// Free software released under GNU Public Licence v2.0.
//

// set up colour palettes for colouring the levels outside the set itself

export type FractalPlane = {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
};

export const defaultMandelbrotPlane: FractalPlane = {
    x_min: -2.5,
    y_min: -1.25,
    x_max: 0.8,
    y_max: 1.25
  };

  export const defaultJuliaPlane: FractalPlane = {
    x_min: -2.0,
    y_min: -1.5,
    x_max: 2.0,
    y_max: 1.5
  };

export type Point = { x: number; y: number };

export type OptionType = {
  value: string;
  label: string;
};

export const renderOptions: OptionType[] = [
  { value: "lsm", label: "Level Set Method (LSM)" },
  { value: "dem", label: "Distance Estimator Method (DEM)" },
  { value: "bdm", label: "Binary Decomposition Method (BDM)" },
  { value: "tdm", label: "Trinary Decomposition Method (TDM)" },
  { value: "bdm2", label: "Binary Decomposition Method II (BDM2)" },
];

export const colourPalettes: string[][] =
    [
        ['#00429d', '#1448a0', '#204fa3', '#2955a6', '#315ca9', '#3862ac', '#3f69af', '#466fb2', '#4c76b5', '#527db7', '#5884ba', '#5e8abd', '#6491c0', '#6a98c2', '#709fc5', '#76a6c8', '#7cadca', '#83b4cd', '#89bbcf', '#90c2d2', '#97c9d4', '#9fd0d6', '#a7d6d8', '#afddda', '#b8e4dc', '#c2eade', '#ccf1e0', '#d9f7e1', '#e8fce1', '#ffffe0'],
        ['#94003a', '#98163e', '#9c2341', '#a12e45', '#a53849', '#a9414d', '#ae4951', '#b25155', '#b65959', '#ba615e', '#be6962', '#c27167', '#c6796b', '#ca8070', '#cd8874', '#d19079', '#d5977e', '#d99f83', '#dca689', '#e0ae8e', '#e3b694', '#e7bd9a', '#eac5a0', '#edcda6', '#f1d4ad', '#f4dcb4', '#f7e4bc', '#faebc5', '#fdf3cf', '#fffadf'],
        ['#890079', '#8c197d', '#8e2881', '#903385', '#933d89', '#95478d', '#975091', '#995995', '#9b619a', '#9d699e', '#9f71a2', '#a179a6', '#a281aa', '#a489af', '#a691b3', '#a798b7', '#a9a0bc', '#aba8c0', '#adafc5', '#afb7c9', '#b1bece', '#b3c6d2', '#b6cdd7', '#b8d5dc', '#bcdce1', '#c0e3e6', '#c5eaeb', '#ccf0f1', '#d5f6f7', '#e9f9ff'],
        ['#007600', '#177b09', '#257f12', '#318419', '#3b8921', '#448e28', '#4d922f', '#569736', '#5e9c3d', '#66a144', '#6fa54c', '#77aa54', '#7faf5b', '#86b463', '#8eb86b', '#96bd74', '#9ec27c', '#a6c685', '#adcb8e', '#b5d097', '#bcd5a1', '#c4d9aa', '#cbdeb4', '#d3e3be', '#dae7c8', '#e2ecd3', '#e9f1de', '#f0f6e8', '#f8faf4', '#ffffff'],
        ['#007600', '#257f11', '#3a8820', '#4b912d', '#5c9b3b', '#6ca449', '#7bad58', '#8bb668', '#9abf78', '#a9c889', '#b7d19a', '#c6dbad', '#d4e4c0', '#e3edd4', '#f1f6e9', '#ffeed3', '#ffdcc6', '#ffcab9', '#ffb8ab', '#ffa59e', '#fd9291', '#f78085', '#f06f7a', '#e75d6f', '#dd4c65', '#d23b5b', '#c52a52', '#b61849', '#a60741', '#93003a'],
        ['#007ca6', '#0986ac', '#198fb2', '#2999b8', '#39a3bf', '#48acc5', '#59b5cb', '#69bed1', '#7ac7d7', '#8ccfdc', '#9ed8e2', '#b0e0e8', '#c3e8ee', '#d7f0f4', '#ebf8f9', '#ffeed3', '#ffdcc6', '#ffcab9', '#ffb8ab', '#ffa59e', '#fd9291', '#f78085', '#f06f7a', '#e75d6f', '#dd4c65', '#d23b5b', '#c52a52', '#b61849', '#a60741', '#93003a'],
        ['#007ca6', '#0986ac', '#198fb2', '#2999b8', '#39a3bf', '#48acc5', '#59b5cb', '#69bed1', '#7ac7d7', '#8ccfdc', '#9ed8e2', '#b0e0e8', '#c3e8ee', '#d7f0f4', '#ebf8f9', '#e8f7ea', '#e3f0eb', '#dde8ed', '#d7e1ee', '#d1daef', '#cbd3f0', '#c4cbf1', '#bdc4f2', '#b7bdf2', '#afb6f3', '#a8aff3', '#a0a9f3', '#98a2f2', '#8f9cf1', '#7a9cdc'],
        ['#ef1d00', '#e54d29', '#dc6744', '#d47b5c', '#cc8c72', '#c59b87', '#c0a899', '#bcb5aa', '#bac0ba', '#bacbc8', '#bed5d4', '#c5dfdf', '#cfe8e9', '#dcf0f2', '#edf8f9', '#20f8ff', '#2ef2ff', '#38ebff', '#40e4ff', '#47deff', '#4cd7ff', '#50d0ff', '#54cafe', '#58c3fe', '#5bbcfd', '#5eb6fc', '#60affb', '#63a9fa', '#65a2f8', '#7a9cdc'],
        ['#00429d', '#1f4ea3', '#305ba9', '#3e67ae', '#4a74b4', '#5681b9', '#618fbf', '#6d9cc4', '#79a9c9', '#85b7ce', '#93c4d2', '#a1d1d7', '#b1dfdb', '#c3ebde', '#daf7e1', '#ffeed3', '#ffdcc6', '#ffcab9', '#ffb8ab', '#ffa59e', '#fd9291', '#f78085', '#f06f7a', '#e75d6f', '#dd4c65', '#d23b5b', '#c52a52', '#b61849', '#a60741', '#93003a'],
        ['#000000', '#090d0c', '#111615', '#161e1c', '#1b2523', '#202d2a', '#253531', '#2a3d38', '#304540', '#364d47', '#3b564f', '#415e57', '#48675f', '#4e7067', '#55796f', '#5c8277', '#638b7f', '#6a9487', '#729e8f', '#7aa798', '#83b1a0', '#8cbaa8', '#96c3b1', '#a0cdb9', '#aad6c1', '#b6dfc9', '#c3e9d0', '#d1f1d7', '#e3fadd', '#ffffe0'],
        ['#914ce2', '#9953dc', '#a059d7', '#a760d1', '#ad66cc', '#b36dc7', '#b973c2', '#be79bd', '#c380b9', '#c786b4', '#cc8cb0', '#d093ac', '#d499a8', '#d89fa4', '#dba5a0', '#dfac9d', '#e2b29a', '#e5b897', '#e8be95', '#ebc493', '#eeca92', '#f1d192', '#f4d792', '#f7dd94', '#f9e396', '#fce99b', '#feefa3', '#fff5ae', '#fffac1', '#ffffe0'],
        ['#914ce2', '#a059d7', '#ad66cd', '#b872c3', '#c27eba', '#ca8ab1', '#d296a9', '#daa2a2', '#e0af9c', '#e6ba96', '#ecc693', '#f2d292', '#f7de94', '#fcea9c', '#fff5af', '#ffeed3', '#ffdcc6', '#ffcab9', '#ffb8ab', '#ffa59e', '#fd9291', '#f78085', '#f06f7a', '#e75d6f', '#dd4c65', '#d23b5b', '#c52a52', '#b61849', '#a60741', '#93003a'],
        ['#ffffe0', '#fbffe0', '#f8ffe1', '#f5ffe1', '#f2fee1', '#f0fee1', '#eefde1', '#ecfde1', '#e9fce1', '#e7fce1', '#e6fbe1', '#e4fbe1', '#e2fae1', '#e0fae1', '#def9e1', '#ddf8e1', '#dbf8e1', '#daf7e1', '#d8f6e1', '#d7f6e1', '#d5f5e0', '#d4f5e0', '#d2f4e0', '#d1f3e0', '#cff2e0', '#cef2e0', '#cdf1e0', '#ccf0df', '#caf0df', '#c9efdf', '#c8eedf', '#c6eddf', '#c5eddf', '#c4ecde', '#c3ebde', '#c2ebde', '#c1eade', '#bfe9de', '#bee8de', '#bde8dd', '#bce7dd', '#bbe6dd', '#bae5dd', '#b9e5dc', '#b8e4dc', '#b7e3dc', '#b6e2dc', '#b5e2dc', '#b4e1db', '#b3e0db', '#b2dfdb', '#b1dfdb', '#b0dedb', '#afddda', '#aedcda', '#addbda', '#acdbda', '#abdad9', '#aad9d9', '#a9d8d9', '#a8d8d9', '#a7d7d8', '#a6d6d8', '#a5d5d8', '#a4d5d8', '#a4d4d7', '#a3d3d7', '#a2d2d7', '#a1d1d7', '#a0d1d7', '#9fd0d6', '#9ecfd6', '#9dced6', '#9dcdd6', '#9ccdd5', '#9bccd5', '#9acbd5', '#99cad4', '#98cad4', '#97c9d4', '#97c8d4', '#96c7d3', '#95c6d3', '#94c6d3', '#93c5d3', '#93c4d2', '#92c3d2', '#91c2d2', '#90c2d2', '#8fc1d1', '#8fc0d1', '#8ebfd1', '#8dbed0', '#8cbed0', '#8cbdd0', '#8bbcd0', '#8abbcf', '#89bbcf', '#88bacf', '#88b9cf', '#87b8ce', '#86b7ce', '#85b7ce', '#85b6cd', '#84b5cd', '#83b4cd', '#82b3cd', '#82b3cc', '#81b2cc', '#80b1cc', '#7fb0cb', '#7fafcb', '#7eafcb', '#7daecb', '#7dadca', '#7cacca', '#7bacca', '#7aabc9', '#7aaac9', '#79a9c9', '#78a8c9', '#78a8c8', '#77a7c8', '#76a6c8', '#75a5c7', '#75a4c7', '#74a4c7', '#73a3c6', '#73a2c6', '#72a1c6', '#71a0c6', '#71a0c5', '#709fc5', '#6f9ec5', '#6e9dc4', '#6e9dc4', '#6d9cc4', '#6c9bc3', '#6c9ac3', '#6b99c3', '#6a99c3', '#6a98c2', '#6997c2', '#6896c2', '#6896c1', '#6795c1', '#6694c1', '#6693c0', '#6592c0', '#6492c0', '#6391c0', '#6390bf', '#628fbf', '#618fbf', '#618ebe', '#608dbe', '#5f8cbe', '#5f8bbd', '#5e8bbd', '#5d8abd', '#5d89bc', '#5c88bc', '#5b88bc', '#5b87bb', '#5a86bb', '#5985bb', '#5984ba', '#5884ba', '#5783ba', '#5782ba', '#5681b9', '#5581b9', '#5580b9', '#547fb8', '#537eb8', '#527db8', '#527db7', '#517cb7', '#507bb7', '#507ab6', '#4f7ab6', '#4e79b6', '#4e78b5', '#4d77b5', '#4c77b5', '#4c76b4', '#4b75b4', '#4a74b4', '#4974b3', '#4973b3', '#4872b3', '#4771b2', '#4771b2', '#4670b2', '#456fb1', '#446eb1', '#446db1', '#436db1', '#426cb0', '#416bb0', '#416ab0', '#406aaf', '#3f69af', '#3e68af', '#3e67ae', '#3d67ae', '#3c66ae', '#3b65ad', '#3b64ad', '#3a64ad', '#3963ac', '#3862ac', '#3761ac', '#3761ab', '#3660ab', '#355fab', '#345eaa', '#335eaa', '#335daa', '#325ca9', '#315ba9', '#305ba9', '#2f5aa8', '#2e59a8', '#2d59a8', '#2c58a7', '#2b57a7', '#2b56a7', '#2a56a6', '#2955a6', '#2854a6', '#2753a5', '#2653a5', '#2552a5', '#2451a4', '#2250a4', '#2150a3', '#204fa3', '#1f4ea3', '#1e4ea2', '#1d4da2', '#1b4ca2', '#1a4ba1', '#194ba1', '#174aa1', '#1649a0', '#1448a0', '#1248a0', '#11479f', '#0f469f', '#0c469f', '#0a459e', '#07449e', '#05439e', '#03439d', '#00429d'],
        ['#ffe2ff', '#fce2fb', '#fbe2fa', '#fae1f8', '#f9e1f7', '#f9e0f6', '#f8e0f4', '#f7dff3', '#f7def2', '#f6def1', '#f6ddf0', '#f5dcef', '#f5dbee', '#f4dbed', '#f4daec', '#f3d9eb', '#f3d9ea', '#f2d8e9', '#f2d7e8', '#f1d6e7', '#f1d6e6', '#f0d5e5', '#f0d4e4', '#f0d3e3', '#efd3e2', '#efd2e1', '#eed1e0', '#eed0df', '#edd0de', '#edcfdd', '#edcedc', '#eccddb', '#eccdda', '#ebccda', '#ebcbd9', '#ebcad8', '#eac9d7', '#eac9d6', '#eac8d5', '#e9c7d4', '#e9c6d3', '#e8c6d2', '#e8c5d2', '#e8c4d1', '#e7c3d0', '#e7c3cf', '#e6c2ce', '#e6c1cd', '#e6c0cc', '#e5bfcc', '#e5bfcb', '#e5beca', '#e4bdc9', '#e4bcc8', '#e4bcc7', '#e3bbc7', '#e3bac6', '#e3b9c5', '#e2b8c4', '#e2b8c3', '#e1b7c2', '#e1b6c2', '#e1b5c1', '#e0b5c0', '#e0b4bf', '#e0b3be', '#dfb2be', '#dfb1bd', '#dfb1bc', '#deb0bb', '#deafba', '#ddaeb9', '#ddaeb9', '#ddadb8', '#dcacb7', '#dcabb6', '#dcaab6', '#dbaab5', '#dba9b4', '#dba8b3', '#daa7b2', '#daa6b2', '#daa6b1', '#d9a5b0', '#d9a4af', '#d8a3ae', '#d8a3ae', '#d8a2ad', '#d7a1ac', '#d7a0ab', '#d79fab', '#d69faa', '#d69ea9', '#d69da8', '#d59ca7', '#d59ba7', '#d59ba6', '#d49aa5', '#d499a4', '#d398a4', '#d398a3', '#d397a2', '#d296a1', '#d295a1', '#d294a0', '#d1949f', '#d1939e', '#d1929e', '#d0919d', '#d0909c', '#cf909b', '#cf8f9b', '#cf8e9a', '#ce8d99', '#ce8d98', '#ce8c98', '#cd8b97', '#cd8a96', '#cd8995', '#cc8995', '#cc8894', '#cb8793', '#cb8692', '#cb8592', '#ca8591', '#ca8490', '#ca838f', '#c9828f', '#c9818e', '#c8818d', '#c8808c', '#c87f8c', '#c77e8b', '#c77d8a', '#c77d8a', '#c67c89', '#c67b88', '#c57a87', '#c57a87', '#c57986', '#c47885', '#c47785', '#c47684', '#c37683', '#c37582', '#c27482', '#c27381', '#c27280', '#c17280', '#c1717f', '#c1707e', '#c06f7d', '#c06e7d', '#bf6e7c', '#bf6d7b', '#bf6c7b', '#be6b7a', '#be6a79', '#bd6979', '#bd6978', '#bd6877', '#bc6776', '#bc6676', '#bb6575', '#bb6574', '#bb6474', '#ba6373', '#ba6272', '#b96172', '#b96171', '#b96070', '#b85f70', '#b85e6f', '#b75d6e', '#b75c6e', '#b75c6d', '#b65b6c', '#b65a6b', '#b5596b', '#b5586a', '#b55769', '#b45769', '#b45668', '#b35567', '#b35467', '#b35366', '#b25265', '#b25265', '#b15164', '#b15063', '#b14f63', '#b04e62', '#b04d61', '#af4d61', '#af4c60', '#ae4b5f', '#ae4a5f', '#ae495e', '#ad485e', '#ad475d', '#ac465c', '#ac465c', '#ac455b', '#ab445a', '#ab435a', '#aa4259', '#aa4158', '#a94058', '#a93f57', '#a93e56', '#a83d56', '#a83d55', '#a73c54', '#a73b54', '#a63a53', '#a63953', '#a63852', '#a53751', '#a53651', '#a43550', '#a4344f', '#a3334f', '#a3324e', '#a3314d', '#a2304d', '#a22f4c', '#a12e4c', '#a12d4b', '#a02c4a', '#a02b4a', '#9f2a49', '#9f2848', '#9e2748', '#9e2647', '#9e2547', '#9d2446', '#9d2345', '#9c2145', '#9c2044', '#9b1f44', '#9b1d43', '#9a1c42', '#9a1b42', '#9a1941', '#991841', '#991640', '#98143f', '#98133f', '#97113e', '#970f3e', '#960d3d', '#960a3c', '#95083c', '#95053b', '#94023b', '#94003a'],
        ['#ffe2ff', '#fbe2fa', '#f9e1f7', '#f8e0f4', '#f7def2', '#f6ddf0', '#f5dbee', '#f4daec', '#f3d9ea', '#f2d7e8', '#f1d6e6', '#f0d4e4', '#efd3e2', '#eed1e0', '#edd0de', '#edcedc', '#eccddb', '#ebcbd9', '#eacad7', '#eac8d5', '#e9c7d3', '#e8c5d2', '#e7c3d0', '#e7c2ce', '#e6c0cd', '#e5bfcb', '#e4bdc9', '#e4bcc8', '#e3bac6', '#e2b9c4', '#e1b7c3', '#e1b6c1', '#e0b4bf', '#dfb2be', '#dfb1bc', '#deafbb', '#ddaeb9', '#dcacb7', '#dcabb6', '#dba9b4', '#daa7b3', '#daa6b1', '#d9a4af', '#d8a3ae', '#d8a1ac', '#d7a0ab', '#d69ea9', '#d59da8', '#d59ba6', '#d499a5', '#d398a3', '#d396a2', '#d295a0', '#d1939f', '#d0929d', '#d0909c', '#cf8e9a', '#ce8d99', '#cd8b97', '#cd8a96', '#cc8894', '#cb8793', '#cb8591', '#ca8390', '#c9828e', '#c8808d', '#c87f8b', '#c77d8a', '#c67c89', '#c57a87', '#c57886', '#c47784', '#c37583', '#c27481', '#c27280', '#c1707f', '#c06f7d', '#bf6d7c', '#be6c7a', '#be6a79', '#bd6878', '#bc6776', '#bb6575', '#bb6473', '#ba6272', '#b96071', '#b85f6f', '#b75d6e', '#b75b6d', '#b65a6b', '#b5586a', '#b45669', '#b35567', '#b35366', '#b25165', '#b15063', '#b04e62', '#af4c61', '#ae4b5f', '#ae495e', '#ad475d', '#ac455b', '#ab445a', '#aa4259', '#a94058', '#a83e56', '#a83c55', '#a73b54', '#a63952', '#a53751', '#a43550', '#a3334f', '#a2314d', '#a22f4c', '#a12d4b', '#a02b4a', '#9f2848', '#9e2647', '#9d2446', '#9c2145', '#9b1f44', '#9a1c42', '#9a1941', '#991640', '#98133f', '#970f3e', '#960a3c', '#95053b', '#fff1ed', '#fff0eb', '#ffeeea', '#ffece8', '#ffeae6', '#ffe8e4', '#ffe6e3', '#ffe4e1', '#ffe2df', '#ffe0dd', '#ffdedc', '#ffdcda', '#ffdad8', '#ffd8d6', '#ffd6d5', '#ffd4d3', '#ffd2d1', '#ffd0cf', '#ffcece', '#ffcccc', '#ffcaca', '#ffc8c9', '#ffc6c7', '#ffc4c5', '#ffc2c3', '#ffc0c2', '#ffbec0', '#ffbcbe', '#ffbabc', '#ffb8bb', '#ffb5b9', '#ffb3b7', '#ffb1b5', '#ffafb4', '#ffadb2', '#ffabb0', '#ffa9ae', '#ffa7ad', '#ffa4ab', '#ffa2a9', '#ffa0a7', '#ff9ea5', '#ff9ca4', '#ff99a2', '#ff97a0', '#ff959e', '#ff939d', '#fe919b', '#fe8f99', '#fd8d98', '#fc8b96', '#fc8995', '#fb8793', '#fb8592', '#fa8390', '#f9818f', '#f87f8d', '#f87d8c', '#f77b8a', '#f67989', '#f57787', '#f57586', '#f47384', '#f37183', '#f26f81', '#f16d80', '#f06b7e', '#ef697d', '#ee677c', '#ed657a', '#ec6379', '#eb6177', '#ea5f76', '#e95d75', '#e85b73', '#e75972', '#e65771', '#e5556f', '#e4536e', '#e3526d', '#e2506b', '#e04e6a', '#df4c69', '#de4a68', '#dd4866', '#db4665', '#da4464', '#d94263', '#d84061', '#d63e60', '#d53c5f', '#d43a5e', '#d2395c', '#d1375b', '#cf355a', '#ce3359', '#cc3158', '#cb2f57', '#c92d56', '#c82b54', '#c62953', '#c52752', '#c32551', '#c12450', '#c0224f', '#be204e', '#bc1e4d', '#bb1c4c', '#b91a4b', '#b7184a', '#b51649', '#b31448', '#b21247', '#b01046', '#ae0e45', '#ac0c44', '#aa0b43', '#a80942', '#a60741', '#a40541', '#a20440', '#a0033f', '#9e023e', '#9c013d', '#9a013c', '#97003c', '#95003b', '#93003a'],
        ['#94003a', '#95053b', '#960a3c', '#970f3e', '#98133f', '#991640', '#9a1941', '#9a1c42', '#9b1f44', '#9c2145', '#9d2446', '#9e2647', '#9f2949', '#a02b4a', '#a12d4b', '#a22f4c', '#a3314e', '#a3334f', '#a43550', '#a53751', '#a63953', '#a73b54', '#a83d55', '#a93f57', '#a94058', '#aa4259', '#ab445a', '#ac465c', '#ad485d', '#ae495e', '#af4b60', '#af4d61', '#b04e62', '#b15064', '#b25265', '#b35466', '#b45568', '#b45769', '#b5596a', '#b65a6c', '#b75c6d', '#b85e6e', '#b85f70', '#b96171', '#ba6273', '#bb6474', '#bc6675', '#bc6777', '#bd6978', '#be6b7a', '#bf6c7b', '#c06e7c', '#c06f7e', '#c1717f', '#c27381', '#c37482', '#c37683', '#c47785', '#c57986', '#c67b88', '#c67c89', '#c77e8b', '#c87f8c', '#c9818e', '#c9838f', '#ca8491', '#cb8692', '#cc8793', '#cc8995', '#cd8b96', '#ce8c98', '#cf8e99', '#cf8f9b', '#d0919c', '#d1929e', '#d2949f', '#d296a1', '#d397a3', '#d499a4', '#d49aa6', '#d59ca7', '#d69ea9', '#d79faa', '#d7a1ac', '#d8a2ad', '#d9a4af', '#d9a5b1', '#daa7b2', '#dba9b4', '#dcaab5', '#dcacb7', '#ddadb8', '#deafba', '#deb0bc', '#dfb2bd', '#e0b4bf', '#e1b5c1', '#e1b7c2', '#e2b8c4', '#e3bac6', '#e4bbc7', '#e4bdc9', '#e5bfcb', '#e6c0cc', '#e6c2ce', '#e7c3d0', '#e8c5d2', '#e9c6d3', '#e9c8d5', '#eac9d7', '#ebcbd9', '#ecccda', '#edcedc', '#edd0de', '#eed1e0', '#efd3e2', '#f0d4e4', '#f1d6e6', '#f2d7e7', '#f3d9ea', '#f4daec', '#f5dbee', '#f6ddf0', '#f7def2', '#f8e0f4', '#f9e1f7', '#fbe2fa', '#ffe2ff'],
        ['#FFFFFF', '#000000', '#FFFFFF', '#000000', '#FFFFFF', '#000000', '#FFFFFF', '#000000', '#FFFFFF', '#000000', '#FFFFFF', '#000000', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',],
        ['#FFFFFF']
    ];

export function setColourUsingLevelSetMethod(
  iterations: number,
  maxIterations: number,
  ctx: CanvasRenderingContext2D,
  palette: number) {
    if (iterations == maxIterations) { // we are in the set
        ctx.fillStyle = "#000"
    } else {
        // colour it according to the number of iterations it took to get to infinity
      //console.log('palette: ', palette);
        ctx.fillStyle = colourPalettes[palette][iterations % colourPalettes[palette].length]
    }
}

export function getScalingFactors(plane: FractalPlane, xResolution: number, yResolution: number) {
    return {x: (plane.x_max - plane.x_min) / (xResolution - 1), y: (plane.y_max - plane.y_min) / (yResolution - 1)}
}

function computePoint(point: Point, cx: number, cy: number, maxIterations: number, threshold: number): number {
    let x2 = point.x * point.x
    let y2 = point.y * point.y
    let iterations = 0
    while ((iterations < maxIterations) && ((x2 + y2) < threshold)) {
        let temp = x2 - y2 + cx
        point.y = 2 * point.x * point.y + cy
        point.x = temp
        x2 = point.x * point.x
        y2 = point.y * point.y
        iterations++
    }
    return iterations
}
export function generateMandelbrot(
  canvas: HTMLCanvasElement,
  mandelbrotWindow: FractalPlane,
  canvasWidth: number,
  canvasHeight: number,
  maxIterations : number,
  threshold: number,
  palette: number
): string {
  const ctx = canvas.getContext("2d");
  if (ctx !== null) {
    // @ts-ignore
    ctx.reset();
    const scalingFactor = getScalingFactors(mandelbrotWindow, canvasWidth, canvasHeight);
    const manYArray = [];
    for (let iy = 0; iy < canvasHeight; iy++) {
      const cy = mandelbrotWindow.y_min + iy * scalingFactor.y
      const manXArray = [];
      for (let ix = 0; ix < canvasWidth; ix++) {
        const cx = mandelbrotWindow.x_min + ix * scalingFactor.x
        const currentPoint = {x: 0.0, y: 0.0}
        const i = computePoint(currentPoint, cx, cy, maxIterations , threshold);
        setColourUsingLevelSetMethod(i, maxIterations , ctx, palette);
        manXArray.push(i);
        ctx.fillRect(ix, iy, 1, 1)
      }
      manYArray.push(manXArray);
    }
    const stringMan = JSON.stringify(manYArray);
    return stringMan.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g, ' ');
  }
  return "";
}

  export function generateJulia (
    canvas: HTMLCanvasElement,
    juliaWindow: FractalPlane,
    canvasWidth: number,
    canvasHeight: number,
    maxIterations : number,
    threshold: number,
    cx: number,
    cy: number,
    palette: number
  ): string {
    const ctx = canvas.getContext("2d");
    if (ctx !== null) {
      // @ts-ignore
      ctx.reset();
      const scalingFactor = getScalingFactors(juliaWindow, canvasWidth, canvasHeight);
      const juliaYArray = [];
      for (let iy = 0; iy < canvasHeight; iy++) {
        const y = juliaWindow.y_min + iy * scalingFactor.y
        const juliaXArray = [];
        for (let ix = 0; ix < canvasWidth; ix++) {
          const currentPoint = {x: juliaWindow.x_min + ix * scalingFactor.x, y: y}
          const i = computePoint(currentPoint, cx, cy, maxIterations, threshold);
          setColourUsingLevelSetMethod(i, maxIterations, ctx, palette);
          juliaXArray.push(i);
          ctx.fillRect(ix, iy, 1, 1)
        }
        juliaYArray.push(juliaXArray);
      }
      const stringJulia = JSON.stringify(juliaYArray);
      return stringJulia.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g,' ');
    }
    return "";
  }

/*export function mandelbrot(
  canvas: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  mandelbrotWindow:
    FractalPlane,
  iterations: number,
  threshold: number
): string {
    if (canvas) {
      let ctx = canvas.current.getContext("2d");

      if (ctx !== null) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        // @ts-ignore
        ctx.reset();
        const scalingFactor = getScalingFactors(mandelbrotWindow, canvasWidth, canvasHeight);
        const manYArray = [];
        for (let iy = 0; iy < canvasHeight; iy++) {
          const cy = mandelbrotWindow.y_min + iy * scalingFactor.y
          const manXArray = [];
          for (let ix = 0; ix < canvasWidth; ix++) {
            const cx = mandelbrotWindow.x_min + ix * scalingFactor.x
            const currentPoint = {x: 0.0, y: 0.0}
            const theIterations = computePoint(currentPoint, cx, cy, iterations, threshold);
            //setColourUsingLevelSetMethod(theIterations, ctx);
            manXArray.push(theIterations);
            ctx.fillRect(ix, iy, 1, 1)
          }
          manYArray.push(manXArray);
        }
        const stringMan = JSON.stringify(manYArray);
        const mystring = stringMan.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g,' ');
        //sendMandelbrotMessage(mystring);
        return mystring;
      }
      else return "";
    }
    else return "";
  }

export const xResolution = document.getElementById("mset_canvas").clientWidth
export const yResolution = document.getElementById("mset_canvas").clientHeight

export const defaultMsetPlane = {x_min: -2.5, y_min: -1.25, x_max: 0.8, y_max: 1.25}
export const defaultJsetPlane = {x_min: -2.0, y_min: -1.5, x_max: 2.0, y_max: 1.5}

let paletteNumber = 0

const ZOOM_MODE = 'zoom'
const EXPLORE_MODE = 'explore'
let mode = EXPLORE_MODE

class CanvasRectangleSnapshot {
    constructor(imageData, x, y, w, h) {
        this.imageData = imageData
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
}

let canvasBeforeZoomBox = null



export function init() {
    document.getElementById("palette").setAttribute("max", (colourPalettes.length - 1).toString())
    setMsetWindowTo(defaultMsetPlane)
    setZoomWindowTo(160, 120, 320, 240)
}

export function setMsetWindowTo(plane) {
    document.getElementById("x_min").value = plane.x_min
    document.getElementById("y_min").value = plane.y_min
    document.getElementById("x_max").value = plane.x_max
    document.getElementById("y_max").value = plane.y_max
}

export function setZoomWindowTo(x, y, w, h) {
    document.getElementById("zoom_x").value = x
    document.getElementById("zoom_y").value = y
    document.getElementById("zoom_w").value = w
    document.getElementById("zoom_h").value = h
}

export function getCurrentZoomWindow() {
    return {
        x: parseFloat(document.getElementById("zoom_x").value),
        y: parseFloat(document.getElementById("zoom_y").value),
        w: parseFloat(document.getElementById("zoom_w").value),
        h: parseFloat(document.getElementById("zoom_h").value)
    }
}

export function selectMethod() {
    const method = document.getElementById('method').value
    switch (method) {
        case 'lsm':
        case 'dem':
        case 'tdm':
        case 'bdm2':
            document.getElementById("palette_chooser").style.display = 'inline'
            break
        default:
            document.getElementById("palette_chooser").style.display = 'none'
    }
    switch (method) {
        case 'dem':
            document.getElementById("dem-parameters").style.display = 'inline'
            document.getElementById("lsm-parameters").style.display = 'none'
            break
        default:
            document.getElementById("dem-parameters").style.display = 'none'
            document.getElementById("lsm-parameters").style.display = 'inline'
    }
}

export function getCurrentPlane() {
    return {
        x_min: parseFloat(document.getElementById("x_min").value),
        y_min: parseFloat(document.getElementById("y_min").value),
        x_max: parseFloat(document.getElementById("x_max").value),
        y_max: parseFloat(document.getElementById("y_max").value)
    }
}

export function mandelbrot() {
    const canvas = document.getElementById("mset_canvas")
    const currentPlane = getCurrentPlane()
    paletteNumber = document.getElementById('palette').value
    switch (document.getElementById('method').value) {
        case 'dem':
            mandelbrotDrawingFuncDem(canvas.getContext("2d"), document.getElementById('iterations').value, currentPlane)
            break
        default:
            drawSet(canvas, mandelbrotDrawingFuncLsm, currentPlane)
    }
}

export function julia() {
    paletteNumber = document.getElementById('palette').value
    drawSet(document.getElementById("jset_canvas"), juliaDrawingFuncLsm, defaultJsetPlane)
}

export function drawSet(canvas, drawingFunc, plane) {
    const ctx = canvas.getContext("2d")
    ctx.reset()
    const max_iters = document.getElementById('iterations').value
    const method = document.getElementById('method').value

    drawingFunc(ctx, max_iters, getColouringFunctionForMethod(method), plane)
}

export function getColouringFunctionForMethod(method) {
    switch (method) {
        case 'bdm':
            return setColourUsingBinaryDecompositionMethod
        case 'bdm2':
            return setColourUsingBinaryDecompositionMethod2
        case 'tdm':
            return setColourUsingTrinaryDecompositionMethod
        case 'lsm':
        default:
            return setColourUsingLevelSetMethod
    }
}

export function setColourUsingBinaryDecompositionMethod(iterations, maxIterations, ctx, point) {
    if (iterations == maxIterations) { // we are in the set
        ctx.fillStyle = "#000"
    } else {
        // color it depending on the angle of alpha
        const alpha = Math.atan2(point.y, point.x)
        if ((alpha >= 0) && (alpha < 2 * Math.PI)) {
            ctx.fillStyle = "#000"
        } else {
            ctx.fillStyle = "#fff"
        }
    }
}

export function setColourUsingTrinaryDecompositionMethod(iterations, maxIterations, ctx, point) {
    if (iterations == maxIterations) { // we are in the set
        ctx.fillStyle = "#000"
    } else {
        // color it depending on the angle of alpha
        const alpha = Math.atan2(point.y, point.x) * 180 / Math.PI
        if ((alpha > 0) && (alpha <= 90)) {
            ctx.fillStyle = colourPalettes[paletteNumber][iterations % colourPalettes[paletteNumber].length % 3]
        } else if ((alpha >= 90) && (alpha < 180)) {
            ctx.fillStyle = colourPalettes[paletteNumber][iterations % colourPalettes[paletteNumber].length % 2]
        } else {
            ctx.fillStyle = colourPalettes[paletteNumber][iterations % colourPalettes[paletteNumber].length]
        }
    }
}

export function setColourUsingBinaryDecompositionMethod2(iterations, maxIterations, ctx, point) {
    if (iterations == maxIterations) { // we are in the set
        ctx.fillStyle = "#000"
    } else {
        const alpha = Math.atan(Math.abs(point.y))
        if ((alpha > 0) && (alpha <= 1.5)) {
            ctx.fillStyle = colourPalettes[paletteNumber][iterations % colourPalettes[paletteNumber].length % 2]
        } else {
            ctx.fillStyle = colourPalettes[paletteNumber][iterations % colourPalettes[paletteNumber].length]
        }
    }
}

export function setColourUsingLevelSetMethod(iterations, maxIterations, ctx) {
    if (iterations == maxIterations) { // we are in the set
        ctx.fillStyle = "#000"
    } else {
        // colour it according to the number of iterations it took to get to infinity
        ctx.fillStyle = colourPalettes[paletteNumber][iterations % colourPalettes[paletteNumber].length]
    }
}

export function mandelbrotDrawingFuncLsm(ctx, maxIterations, pointColouringFunc, plane, width, height) {
    const scalingFactor = getScalingFactors(plane)

    for (let iy = 0; iy < yResolution; iy++) {
        const cy = plane.y_min + iy * scalingFactor.y

        for (let ix = 0; ix < xResolution; ix++) {
            const cx = plane.x_min + ix * scalingFactor.x
            const currentPoint = {x: 0.0, y: 0.0}
            const iterations = computePoint(currentPoint, cx, cy, maxIterations)

            pointColouringFunc(iterations, maxIterations, ctx, currentPoint)
            ctx.fillRect(ix, iy, 1, 1)
        }
    }
}

export function mandelbrotDrawingFuncDem(ctx, maxIterations, plane) {
    const scalingFactor = getScalingFactors(plane)
    const delta = document.getElementById('dem-threshold').value * scalingFactor.x
    const manYArray = [];
    for (let iy = 0; iy < yResolution; iy++) {
        let manXArray = [];
        const cy = plane.y_min + iy * scalingFactor.y

        for (let ix = 0; ix < xResolution; ix++) {
            const cx = plane.x_min + ix * scalingFactor.x
            const currentPoint = {x: 0.0, y: 0.0}
            const dist = computePointDem(currentPoint, cx, cy, maxIterations)
            if (dist < delta) {
                ctx.fillStyle = "#000000"
            } else {
                ctx.fillStyle = colourPalettes[paletteNumber][parseInt(dist * 100 % colourPalettes[paletteNumber].length)]
            }
            ctx.fillRect(ix, iy, 1, 1)
            manXArray.push(dist);
        }
        manYArray.push(manXArray);
    }
    //console.log("MANDELBROT: ", manYArray);
    const stringMan = JSON.stringify(manYArray);
    const mystring = stringMan.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g,' ');
    console.log("CapyTalk MANDELBROT: ", mystring);
}

export function computePointDem(point, cx, cy, maxIterations) {
    const huge = 100000.0
    let x = point.x, y = point.y, x2 = 0.0, y2 = 0.0, dist = 0.0, xorbit = [], yorbit = []
    xorbit[0] = 0.0
    yorbit[0] = 0.0

    let iterations = 0
    while ((iterations < maxIterations) && ((x2 + y2) < huge)) {
        let temp = x2 - y2 + cx
        y = 2 * x * y + cy
        x = temp
        x2 = x * x
        y2 = y * y
        iterations++
        xorbit[iterations] = x
        yorbit[iterations] = y
    }
    const overflow = document.getElementById('dem-overflow').value
    if ((x2 + y2) > huge) {
        let xder = 0.0, yder = 0.0
        let i = 0
        let flag = false
        while ((i < iterations) && !flag) {
            let temp = 2 * (xorbit[i] * xder - yorbit[i] * yder) + 1
            yder = 2 * (yorbit[i] * xder + xorbit[i] * yder)
            xder = temp
            flag = Math.max(Math.abs(xder), Math.abs(yder)) > overflow
            i++
        }
        if (!flag) {
            dist = (Math.log(x2 + y2) * Math.sqrt(x2 + y2)) / Math.sqrt(xder * xder + yder * yder)
        }
    }

    return dist
}

export function juliaDrawingFuncLsm(ctx, maxIterations, pointColouringFunc, plane) {
    const scalingFactor = getScalingFactors(plane)

    const cx = Number(document.getElementById('cx').value)
    const cy = Number(document.getElementById('cy').value)

    let yArray = [];
    for (let iy = 0; iy < yResolution; iy++) {
        const y = plane.y_min + iy * scalingFactor.y

        const xArray = [];

        for (let ix = 0; ix < xResolution; ix++) {
            const currentPoint = {x: plane.x_min + ix * scalingFactor.x, y: y}
            const iterations = computePoint(currentPoint, cx, cy, maxIterations)

            pointColouringFunc(iterations, maxIterations, ctx, currentPoint)
            xArray.push(iterations);
            ctx.fillRect(ix, iy, 1, 1)
        }
        yArray.push(xArray);
    }
    //console.log("JULIA: ", JSON.stringify(yArray));
    const stringJulia = JSON.stringify(yArray);
    const mystring = stringJulia.replace(/\[/g, '(').replace(/]/g, ')').replace(/,/g,' ');
    console.log("CapyTalk JULIA: ", mystring);
}

export function getMousePos(evt, canvas) {
    const rect = canvas.getBoundingClientRect()
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    }
}

export function setJuliaSetCoordinates(evt, canvas) {
    const pos = getMousePos(evt, canvas)
    const currentPlane = getCurrentPlane()
    const scalingFactors = getScalingFactors(currentPlane)
    const cx = currentPlane.x_min + pos.x * scalingFactors.x
    const cy = currentPlane.y_min + pos.y * scalingFactors.y
    document.getElementById('cx').value = cx
    document.getElementById('cy').value = cy
}

export function zoomToNewWindow(ctx, canvas) {
    const {x, y, w, h} = getCurrentZoomWindow()
    const currentPlane = getCurrentPlane()
    const scalingFactors = getScalingFactors(currentPlane)
    const zoomedPlane = {
        x_min: currentPlane.x_min + x * scalingFactors.x,
        y_min: currentPlane.y_min + y * scalingFactors.y,
        x_max: currentPlane.x_min + (x + w) * scalingFactors.x,
        y_max: currentPlane.y_min + (y + h) * scalingFactors.y
    }

    setMsetWindowTo(zoomedPlane)
    ctx.reset()
    mandelbrot()
    mode = EXPLORE_MODE
}

export function keyCommandProcessor(e) {
    const eventObject = window.event ? event : e //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
    const keyCode = eventObject.charCode ? eventObject.charCode : eventObject.keyCode
    const Z_KEY_CODE = 90
    const ENTER_KEY_CODE = 13
    const A_KEY_CODE = 65
    let canvas = document.getElementById("mset_canvas")
    let ctx = canvas.getContext("2d")
    switch (keyCode) {
        case Z_KEY_CODE:
            if (mode !== ZOOM_MODE) {
                mode = ZOOM_MODE
                drawZoomBox(ctx, getCurrentZoomWindow())
            } else {
                ctx.reset()
                mandelbrot()
                mode = EXPLORE_MODE
            }
            break
        case ENTER_KEY_CODE:
            if (mode === ZOOM_MODE) {
                zoomToNewWindow(ctx, canvas)
            }
            break
        case A_KEY_CODE:
            const autodraw = document.getElementById("autodraw");
            if (autodraw.value == 'off') {
                autodraw.value = 'on'
            } else {
                autodraw.value = 'off'
            }
            break
        default:
            console.log("key code is " + keyCode)
    }
}

export function drawJuliaSetForCurrentC(event, canvas) {
    setJuliaSetCoordinates(event, canvas)
    julia()
}

export function handleMsetMouseMove(event, canvas) {
    function moveZoomBox() {
        const {x, y, w, h} = getCurrentZoomWindow()
        let ctx = canvas.getContext("2d")
        if (canvasBeforeZoomBox != null) {
            ctx.putImageData(canvasBeforeZoomBox.imageData, canvasBeforeZoomBox.x, canvasBeforeZoomBox.y)
        }
        const x_pos = event.clientX - canvas.offsetLeft
        const y_pos = event.clientY - canvas.offsetTop
        drawZoomBox(ctx, {x: x_pos, y: y_pos, w: w, h: h})
    }

    switch (mode) {
        case ZOOM_MODE:
            moveZoomBox()
            break
        default:
            if (document.getElementById('autodraw').value === 'on') {
                drawJuliaSetForCurrentC(event, canvas)
            }
    }
}

export function handleMsetMouseClick(event, canvas) {
    function zoomIn(ctx) {
        if (canvasBeforeZoomBox != null) {
            ctx.putImageData(canvasBeforeZoomBox.imageData, canvasBeforeZoomBox.x, canvasBeforeZoomBox.y)
        }
        const {x, y, w, h} = getCurrentZoomWindow()
        setZoomWindowTo(x, y, Math.round(w * 0.9), Math.round(h * 0.9))
        drawZoomBox(ctx, getCurrentZoomWindow())
    }

    function zoomOut(ctx) {
        if (canvasBeforeZoomBox != null) {
            ctx.putImageData(canvasBeforeZoomBox.imageData, canvasBeforeZoomBox.x, canvasBeforeZoomBox.y)
        }
        const {x, y, w, h} = getCurrentZoomWindow()
        setZoomWindowTo(x, y, Math.round(w * 1.5), Math.round(h * 1.5))
        drawZoomBox(ctx, getCurrentZoomWindow())
    }

    switch (mode) {
        case ZOOM_MODE:
            let ctx = canvas.getContext("2d")
            switch (event.button) {
                case 0:
                    zoomIn(ctx)
                    break
                case 2:
                    zoomOut(ctx)
                    break
            }
            break
        default:
            drawJuliaSetForCurrentC(event, canvas)
    }
}

export function drawZoomBox(ctx, dimensions) {
    canvasBeforeZoomBox = new CanvasRectangleSnapshot(
        ctx.getImageData(dimensions.x, dimensions.y, dimensions.w, dimensions.h),
        dimensions.x, dimensions.y, dimensions.w, dimensions.h)

    ctx.beginPath()
    ctx.fillStyle = "#FFFFFF"
    ctx.globalAlpha = 0.5
    ctx.fillRect(dimensions.x, dimensions.y, dimensions.w, dimensions.h)
    setZoomWindowTo(dimensions.x, dimensions.y, dimensions.w, dimensions.h)
} */
