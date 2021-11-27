import React, { useState, useEffect } from "react";
import {
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CssBaseline,
  CircularProgress,
  Divider,
  Button,
} from "@material-ui/core";

import { commerce } from "../../../lib/commerce";
import { Link, useNavigate } from "react-router-dom";

import useStyles from "./styles";
import AddressForm from "../AddressForm";
import PaymentForm from "../PaymentForm";

const steps = ["Shipping address", "Payment details"];

const Checkout = ({
  cart,
  order,
  handleCaptureCheckout,
  error,
  refreshCart,
}) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [shippingData, setShippingData] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const history = useNavigate();

  useEffect(() => {
    const generateToken = async () => {
      try {
        const token = await commerce.checkout.generateToken(cart.id, {
          type: "cart",
        });

        setCheckoutToken(token);
      } catch (error) {
        console.log(error);
      }
    };
    generateToken();
  }, [cart]);

  const nextStep = () => {
    setActiveStep((previousActiveStep) => previousActiveStep + 1);
  };
  const backStep = () => {
    setActiveStep((previousActiveStep) => previousActiveStep - 1);
  };

  const next = (data) => {
    setShippingData(data);

    nextStep();
  };

  const timeout = () => {
    setTimeout(() => {
      setIsFinished(true);
      refreshCart();
    }, 3000);
  };

  let Confirmation = () =>
    order.customer ? (
      <>
        <div>
          <Typography variant='h5'>
            Thank you for your purchase, {order.customer.firstname}{" "}
            {order.customer.lastname}
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant='subtitle2'>
            Order ref: {order.customer_reference}
          </Typography>
        </div>
        <br />
        <Button variant='outlined' type='button' component={Link} to='/'>
          Back to Home
        </Button>
      </>
    ) : isFinished ? (
      <>
        <div>
          <Typography variant='h5'>Thank you for your purchase</Typography>
          <Divider className={classes.divider} />
          <Typography variant='subtitle2'>
            Order ref: dummy reference
          </Typography>
        </div>
        <br />
        <Button variant='outlined' type='button' component={Link} to='/'>
          Back to Home
        </Button>
      </>
    ) : (
      <div className={classes.spinner}>
        <CircularProgress />
      </div>
    );

  if (error) {
    <>
      <Typography variant='h5'>Error: {error}</Typography>
      <br />
      <Button variant='outlined' type='button' component={Link} to='/'>
        Back to Home
      </Button>
    </>;
  }

  const Form = () =>
    activeStep === 0 ? (
      <AddressForm
        checkoutToken={checkoutToken}
        next={next}
        setShippingData={setShippingData}
      />
    ) : (
      <PaymentForm
        checkoutToken={checkoutToken}
        backStep={backStep}
        handleCaptureCheckout={handleCaptureCheckout}
        nextStep={nextStep}
        shippingData={shippingData}
        timeout={timeout}
      />
    );

  return (
    <>
      <CssBaseline />
      <div className={classes.toolbar} />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography variant='h4' align='center'>
            Checkout
          </Typography>
          <Stepper activeStep={activeStep} className={classes.Stepper}>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <Confirmation />
          ) : (
            checkoutToken && <Form />
          )}
        </Paper>
      </main>
    </>
  );
};

export default Checkout;
