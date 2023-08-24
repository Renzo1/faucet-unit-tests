const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner, notOwner] = await ethers.getSigners();

    let withdrawAmount = ethers.utils.parseUnits("1", "ether");

    console.log('Signer 1 address: ', owner.address);
    return { faucet, owner, notOwner, withdrawAmount};
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawals above .1 ETH at a time', async function(){
    const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);
    
    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  })
  
  it('should only allow the owner to call withdrawAll()', async function () {
    const { faucet, notOwner } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(notOwner).withdrawAll()).to.be.reverted;
  });

  it('should self destruct when destroyFaucet() is called by the owner', async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);
    
    await faucet.destroyFaucet();

    // Check if the contract has self-destructed by checking its code
    const code = await ethers.provider.getCode(faucet.address);
    expect(code).to.equal('0x');
  });

  it('should only allow the owner to call destroyFaucet()', async function () {
    const { faucet, notOwner } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(notOwner).destroyFaucet()).to.be.reverted;
  });

  /* broken
  it('should return all ether to the caller when withdrawAll() is called', async function () {
    const { faucet, owner, notOwner } = await loadFixture(deployContractAndSetVariables);

    const initialContractBalance = await ethers.provider.getBalance(faucet.address);
    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

    // Send some ether to the contract
    await owner.sendTransaction({
      to: faucet.address,
      value: ethers.utils.parseEther("0.5")
    });

    await faucet.withdrawAll();

    const finalContractBalance = await ethers.provider.getBalance(faucet.address);
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

    // Check that the contract's balance is 0 after withdrawal
    expect(finalContractBalance).to.equal(0);

    // Check that the owner's balance has increased after withdrawal
    expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
  });
  */


});