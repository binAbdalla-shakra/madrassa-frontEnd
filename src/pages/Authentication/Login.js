import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Row, Spinner } from 'reactstrap';
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
// actions
import { loginUser } from "../../slices/thunks";
import logoLight from "../../assets/images/madrassa-logo-one.png";
const Login = (props) => {
  const dispatch = useDispatch();
  const [passwordShow, setPasswordShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redux user state
  const { user, error } = useSelector(state => state.Login || {});

  // Formik setup
  const validation = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Please Enter Your Username"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await dispatch(loginUser(values, props.router.navigate));
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error("Login failed. Please check your username and password.", { position: "top-right" });
      }
    },
  });

  // Handle Redux error changes
  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-right" });
      setLoading(false);
    }
  }, [error]);

  document.title = "Madrassa";

   return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content mt-lg-5">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={logoLight} alt="" width="187" height="100" />
                                        </Link>
                                    </div>
                                    <p className="mt-3 fs-15 fw-medium">Premium Admin & Dashboard Madrassa System</p>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4 card-bg-fill">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">Welcome Back !</h5>
                                            <p className="text-muted">Sign in to continue to Madrassa.</p>
                                        </div>
                                        {error && error ? (<Alert color="danger"> {error} </Alert>) : null}
                                        <div className="p-2 mt-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                action="#">

                                                <div className="mb-3">
                                                    <Label htmlFor="username" className="form-label">username</Label>
                                                    <Input
                                                        name="username"
                                                        className="form-control"
                                                        placeholder="Enter username"
                                                        type="text"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.username || ""}
                                                        invalid={
                                                            validation.touched.username && validation.errors.username ? true : false
                                                        }
                                                    />
                                                    {validation.touched.username && validation.errors.username ? (
                                                        <FormFeedback type="invalid">{validation.errors.username}</FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-3">
                                                    <div className="float-end">
                                                        <Link to="/forgot-password" className="text-muted">Forgot password?</Link>
                                                    </div>
                                                    <Label className="form-label" htmlFor="password-input">Password</Label>
                                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                                        <Input
                                                            name="password"
                                                            value={validation.values.password || ""}
                                                            type={passwordShow ? "text" : "password"}
                                                            className="form-control pe-5"
                                                            placeholder="Enter Password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.password && validation.errors.password ? (
                                                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                                        ) : null}
                                                        <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted material-shadow-none" type="button" id="password-addon" onClick={() => setPasswordShow(!passwordShow)}><i className="ri-eye-fill align-middle"></i></button>
                                                    </div>
                                                </div>

                                                <div className="form-check">
                                                    <Input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />
                                                    <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
                                                </div>

                                                <div className="mt-4">
                                                    <Button color="success" disabled={error ? null : loading ? true : false} className="btn btn-success w-100" type="submit">
                                                        {loading ? <Spinner size="sm" className='me-2'> Loading... </Spinner> : null}
                                                        Sign In
                                                    </Button>
                                                </div>

                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                              

                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
            <ToastContainer/>
        </React.Fragment>
    );
};

export default withRouter(Login);
