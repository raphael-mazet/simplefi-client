// @dev: used by Rewinder's getFieldSeedReserves
const fieldInterfaceTypes = {
  curveSwap: [
    {
      name: "curve swap 4 (sUSD)",
      ciId: "8977922f-c0fe-4654-b2e1-d509c65c8273"
    },
    {
      name: "curve swap 3 (sBTC)",
      ciId: "c95d2eeb-781a-4ce8-a4d1-35aeaec2953d"
    },
    {
      name: "curve swap 2 (stEth)",
      ciId: "93695fbe-8328-4ae4-b86f-5a6e93424e02"
    }
  ],
  curveSNX: [
    {
      name: "Curve: sUSD reward gauge",
      ciId: "d39fcad8-ca2b-4add-87d9-50043ee34bd4"
    },
    {
      name: "Curve: sBTC reward gauge",
      ciId: "e7415498-1411-4b6b-bf69-aa9d61ea2e15"
    },
    {
      name: "Curve: stEth reward gauge",
      ciId: "7e3cdf65-e20d-458b-a7c6-7776d960df48"
    }
  ],
  uniswap: [
    {
      name: "uniswap V2 earn",
      ciId: "8718740f-6d08-4482-9a0c-c0cb2561f01c"
    }
  ],
}

export default fieldInterfaceTypes;